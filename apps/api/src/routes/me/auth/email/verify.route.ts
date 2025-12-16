import { EMAIL_VERIFICATION_REQUEST_COOKIE_NAME, SESSION_COOKIE_NAME } from "@mona-ca/core/http";
import { Elysia, t } from "elysia";
import { match } from "ts-pattern";
import { isMobilePlatform, isWebPlatform } from "../../../../core/domain/value-objects";
import { defaultCookieOptions, noContent } from "../../../../core/infra/elysia";
import { toAnyTokenResponse } from "../../../../features/auth";
import { newEmailVerificationRequestToken } from "../../../../features/auth";
import { authPlugin } from "../../../../plugins/auth";
import { containerPlugin } from "../../../../plugins/container";
import { pathDetail } from "../../../../plugins/openapi";
import { ratelimitPlugin } from "../../../../plugins/ratelimit";

export const UpdateEmailVerifyRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(authPlugin())
	.use(
		ratelimitPlugin("me-update-email-verify", {
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
		"/verify",
		async ({
			cookie,
			body: { code, emailVerificationRequestToken: bodyEmailVerificationRequestToken },
			userCredentials,
			clientPlatform,
			rateLimit,
			containers,
			status,
		}) => {
			const rawEmailVerificationRequestToken = match(clientPlatform)
				.when(isWebPlatform, () => cookie[EMAIL_VERIFICATION_REQUEST_COOKIE_NAME].value)
				.when(isMobilePlatform, () => bodyEmailVerificationRequestToken)
				.exhaustive();

			if (!rawEmailVerificationRequestToken) {
				return status("Bad Request", {
					code: "EMAIL_VERIFICATION_REQUEST_INVALID",
					message: "Email verification session is invalid. Please request a new verification email.",
				});
			}

			const emailVerificationRequestToken = newEmailVerificationRequestToken(rawEmailVerificationRequestToken);

			const validationResult = await containers.auth.emailVerificationValidateRequestUseCase.execute(
				userCredentials,
				emailVerificationRequestToken,
			);

			if (validationResult.isErr) {
				return match(validationResult)
					.with({ code: "INVALID_EMAIL_VERIFICATION_REQUEST" }, () =>
						status("Bad Request", {
							code,
							message: "Invalid email verification request. Please request a new verification email.",
						}),
					)
					.with({ code: "EXPIRED_EMAIL_VERIFICATION_REQUEST" }, () =>
						status("Bad Request", {
							code,
							message: "Email verification request has expired. Please request a new verification email.",
						}),
					)
					.exhaustive();
			}

			const { emailVerificationRequest } = validationResult.value;

			const ratelimitResult = await rateLimit.consume(emailVerificationRequest.id, 100);
			if (ratelimitResult.isErr) {
				return status("Too Many Requests", {
					code: "TOO_MANY_REQUESTS",
					message: "Too many requests. Please try again later.",
				});
			}

			const updateResult = await containers.auth.updateEmailVerifyEmailUseCase.execute(
				code,
				userCredentials,
				emailVerificationRequest,
			);

			if (updateResult.isErr) {
				return match(updateResult)
					.with({ code: "EMAIL_ALREADY_REGISTERED" }, () =>
						status("Bad Request", {
							code: "EMAIL_ALREADY_REGISTERED",
							message: "Email is already in use by another account. Please use a different email address.",
						}),
					)
					.with({ code: "INVALID_VERIFICATION_CODE" }, () =>
						status("Bad Request", {
							code: "INVALID_VERIFICATION_CODE",
							message: "Invalid verification code. Please check the code and try again.",
						}),
					)
					.exhaustive();
			}

			const { session, sessionToken } = updateResult.value;

			if (isMobilePlatform(clientPlatform)) {
				return {
					sessionToken: toAnyTokenResponse(sessionToken),
				};
			}

			cookie[EMAIL_VERIFICATION_REQUEST_COOKIE_NAME].remove();

			cookie[SESSION_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: toAnyTokenResponse(sessionToken),
				expires: session.expiresAt,
			});

			return noContent();
		},
		{
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
				[EMAIL_VERIFICATION_REQUEST_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				code: t.String(),
				emailVerificationRequestToken: t.Optional(t.String()),
			}),
			detail: pathDetail({
				operationId: "me-update-email-verify",
				summary: "Update Email Verify",
				description: "Update Email Verify endpoint for the User",
				tag: "Me",
				withAuth: true,
			}),
		},
	);
