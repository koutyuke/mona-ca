import { Elysia, t } from "elysia";
import { noContent } from "../../../core/infra/elysia";
import { EMAIL_VERIFICATION_SESSION_COOKIE_NAME } from "../../../core/lib/http";
import { newEmailVerificationSessionToken } from "../../../features/auth";
import { authPlugin } from "../../../plugins/auth";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";
import { ratelimitPlugin } from "../../../plugins/ratelimit";

const EmailVerificationConfirm = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(authPlugin({ requireEmailVerification: false }))
	.use(
		ratelimitPlugin("email-verification-confirm", {
			maxTokens: 1000,
			refillRate: 500,
			refillInterval: {
				value: 10,
				unit: "m",
			},
		}),
	)
	.onBeforeHandle(async ({ rateLimit, ipAddress, status }) => {
		const result = await rateLimit.consume(ipAddress, 1);
		if (result.isErr) {
			return status("Too Many Requests", {
				code: "TOO_MANY_REQUESTS",
				message: "Too many requests. Please try again later.",
			});
		}
		return;
	})

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
				return status("Unauthorized", {
					code: "EMAIL_VERIFICATION_SESSION_INVALID",
					message: "Email verification session token not found. Please request email verification again.",
				});
			}

			const validationResult = await containers.auth.validateEmailVerificationSessionUseCase.execute(
				userIdentity,
				newEmailVerificationSessionToken(rawEmailVerificationSessionToken),
			);

			if (validationResult.isErr) {
				const { code } = validationResult;

				if (code === "EMAIL_VERIFICATION_SESSION_INVALID") {
					return status("Unauthorized", {
						code: code,
						message: "Invalid email verification session. Please request email verification again.",
					});
				}
				if (code === "EMAIL_VERIFICATION_SESSION_EXPIRED") {
					return status("Unauthorized", {
						code: code,
						message: "Email verification session has expired. Please request email verification again.",
					});
				}
			}

			const { emailVerificationSession } = validationResult.value;

			const ratelimitResult = await rateLimit.consume(userIdentity.id, 100);
			if (ratelimitResult.isErr) {
				return status("Too Many Requests", {
					code: "TOO_MANY_REQUESTS",
					message: "Too many requests. Please try again later.",
				});
			}

			const confirmResult = await containers.auth.emailVerificationConfirmUseCase.execute(
				code,
				userIdentity,
				emailVerificationSession,
			);

			if (confirmResult.isErr) {
				const { code } = confirmResult;

				if (code === "INVALID_VERIFICATION_CODE") {
					return status("Bad Request", {
						code: code,
						message: "Invalid verification code. Please check your email and try again.",
					});
				}
				if (code === "EMAIL_MISMATCH") {
					return status("Bad Request", {
						code: code,
						message: "Email mismatch. Please use the email address you requested verification for.",
					});
				}
			}

			cookie[EMAIL_VERIFICATION_SESSION_COOKIE_NAME].remove();

			return noContent();
		},
		{
			cookie: t.Cookie({
				[EMAIL_VERIFICATION_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				code: t.String(),
				emailVerificationSessionToken: t.Optional(t.String()),
			}),
			detail: pathDetail({
				operationId: "auth-email-verification-confirm",
				summary: "Email Verification Confirm",
				description: "The User can confirm email verification by this endpoint",
				tag: "Auth - Email Verification",
				withAuth: true,
			}),
		},
	);

export { EmailVerificationConfirm };
