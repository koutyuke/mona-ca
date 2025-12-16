import { EMAIL_VERIFICATION_REQUEST_COOKIE_NAME } from "@mona-ca/core/http";
import { Elysia, t } from "elysia";
import { match } from "ts-pattern";
import { isMobilePlatform, isWebPlatform } from "../../../core/domain/value-objects";
import { noContent } from "../../../core/infra/elysia";
import { newEmailVerificationRequestToken } from "../../../features/auth";
import { authPlugin } from "../../../plugins/auth";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";
import { ratelimitPlugin } from "../../../plugins/ratelimit";

export const EmailVerificationVerifyRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(authPlugin({ withEmailVerification: false }))
	.use(
		ratelimitPlugin("email-verification-verify", {
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
			// Validate Email Verification Request
			const rawEmailVerificationRequestToken = match(clientPlatform)
				.when(isWebPlatform, () => cookie[EMAIL_VERIFICATION_REQUEST_COOKIE_NAME].value)
				.when(isMobilePlatform, () => bodyEmailVerificationRequestToken)
				.exhaustive();

			if (!rawEmailVerificationRequestToken) {
				return status("Unauthorized", {
					code: "EMAIL_VERIFICATION_REQUEST_INVALID",
					message: "Email verification session token not found. Please request email verification again.",
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
						status("Unauthorized", {
							code,
							message: "Invalid email verification session. Please request email verification again.",
						}),
					)
					.with({ code: "EXPIRED_EMAIL_VERIFICATION_REQUEST" }, () =>
						status("Unauthorized", {
							code,
							message: "Email verification session has expired. Please request email verification again.",
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

			// Main Logic
			const verifyEmailResult = await containers.auth.emailVerificationVerifyEmailUseCase.execute(
				code,
				userCredentials,
				emailVerificationRequest,
			);

			if (verifyEmailResult.isErr) {
				return match(verifyEmailResult)
					.with({ code: "INVALID_CODE" }, () =>
						status("Bad Request", {
							code,
							message: "Invalid verification code. Please check your email and try again.",
						}),
					)
					.with({ code: "INVALID_EMAIL" }, () =>
						status("Bad Request", {
							code,
							message: "Email mismatch. Please use the email address you requested verification for.",
						}),
					)
					.exhaustive();
			}

			if (isWebPlatform(clientPlatform)) {
				cookie[EMAIL_VERIFICATION_REQUEST_COOKIE_NAME].remove();
			}
			return noContent();
		},
		{
			beforeHandle: async ({ rateLimit, ipAddress, status }) => {
				const result = await rateLimit.consume(ipAddress, 1);
				if (result.isErr) {
					return status("Too Many Requests", {
						code: "TOO_MANY_REQUESTS",
						message: "Too many requests. Please try again later.",
					});
				}
				return;
			},
			cookie: t.Cookie({
				[EMAIL_VERIFICATION_REQUEST_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				code: t.String(),
				emailVerificationRequestToken: t.Optional(t.String()),
			}),
			detail: pathDetail({
				operationId: "auth-email-verification-verify",
				summary: "Email Verification Verify",
				description: "The User can verify email verification code by this endpoint",
				tag: "Auth - Email Verification",
				withAuth: true,
			}),
		},
	);
