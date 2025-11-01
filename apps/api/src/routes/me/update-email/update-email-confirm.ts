import { Elysia, t } from "elysia";
import { defaultCookieOptions, noContent } from "../../../core/infra/elysia";
import { EMAIL_VERIFICATION_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from "../../../core/lib/http";
import { toAnySessionTokenResponse } from "../../../features/auth";
import { newEmailVerificationSessionToken } from "../../../features/auth/domain/value-objects/session-token";
import { authPlugin } from "../../../plugins/auth";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";
import { ratelimitPlugin } from "../../../plugins/ratelimit";

export const UpdateEmailConfirm = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(authPlugin())
	.use(
		ratelimitPlugin("me-update-email-confirm", {
			maxTokens: 1000,
			refillRate: 500,
			refillInterval: {
				value: 10,
				unit: "m",
			},
		}),
	)

	// Route
	.post(
		"/confirm",
		async ({
			cookie,
			body: { code, emailVerificationSessionToken: bodyEmailVerificationSessionToken },
			userIdentity,
			clientType,
			rateLimit,
			containers,
			status,
		}) => {
			const rawEmailVerificationSessionToken =
				clientType === "web" ? cookie[EMAIL_VERIFICATION_SESSION_COOKIE_NAME].value : bodyEmailVerificationSessionToken;

			if (!rawEmailVerificationSessionToken) {
				return status("Bad Request", {
					code: "EMAIL_VERIFICATION_SESSION_INVALID",
					message: "Email verification session is invalid. Please request a new verification email.",
				});
			}

			const validationResult = await containers.auth.validateEmailVerificationSessionUseCase.execute(
				userIdentity,
				newEmailVerificationSessionToken(rawEmailVerificationSessionToken),
			);

			if (validationResult.isErr) {
				const { code } = validationResult;

				if (code === "EMAIL_VERIFICATION_SESSION_EXPIRED") {
					return status("Bad Request", {
						code: "EMAIL_VERIFICATION_SESSION_EXPIRED",
						message: "Email verification session has expired. Please request a new verification email.",
					});
				}
				if (code === "EMAIL_VERIFICATION_SESSION_INVALID") {
					return status("Bad Request", {
						code: "EMAIL_VERIFICATION_SESSION_INVALID",
						message: "Invalid email verification session. Please request a new verification email.",
					});
				}
			}

			const { emailVerificationSession } = validationResult.value;

			const ratelimitResult = await rateLimit.consume(emailVerificationSession.id, 100);
			if (ratelimitResult.isErr) {
				return status("Too Many Requests", {
					code: "TOO_MANY_REQUESTS",
					message: "Too many requests. Please try again later.",
				});
			}

			const updateResult = await containers.auth.updateEmailConfirmUseCase.execute(
				code,
				userIdentity,
				emailVerificationSession,
			);

			if (updateResult.isErr) {
				const { code } = updateResult;

				if (code === "EMAIL_ALREADY_REGISTERED") {
					return status("Bad Request", {
						code: "EMAIL_ALREADY_REGISTERED",
						message: "Email is already in use by another account. Please use a different email address.",
					});
				}
				if (code === "INVALID_VERIFICATION_CODE") {
					return status("Bad Request", {
						code: "INVALID_VERIFICATION_CODE",
						message: "Invalid verification code. Please check the code and try again.",
					});
				}
			}

			const { session, sessionToken } = updateResult.value;

			if (clientType === "mobile") {
				return {
					sessionToken: toAnySessionTokenResponse(sessionToken),
				};
			}

			cookie[EMAIL_VERIFICATION_SESSION_COOKIE_NAME].remove();

			cookie[SESSION_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: sessionToken,
				expires: session.expiresAt,
			});

			return noContent();
		},
		{
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
				[EMAIL_VERIFICATION_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				code: t.String(),
				emailVerificationSessionToken: t.Optional(t.String()),
			}),
			detail: pathDetail({
				operationId: "me-update-email-confirm",
				summary: "Update Email Confirm",
				description: "Update Email Confirm endpoint for the User",
				tag: "Me",
				withAuth: true,
			}),
		},
	);
