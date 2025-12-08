import { PASSWORD_RESET_SESSION_COOKIE_NAME } from "@mona-ca/core/http";
import Elysia, { t } from "elysia";
import { match } from "ts-pattern";
import { isMobilePlatform, isWebPlatform } from "../../../core/domain/value-objects/client-platform";
import { noContent } from "../../../core/infra/elysia";
import { newPasswordResetSessionToken } from "../../../features/auth";
import { clientPlatformPlugin } from "../../../plugins/client-platform";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";
import { ratelimitPlugin } from "../../../plugins/ratelimit";

export const PasswordResetVerifyRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(clientPlatformPlugin)
	.use(
		ratelimitPlugin("password-reset-verify", {
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
			body: { passwordResetSessionToken: bodyPasswordResetSessionToken, code },
			clientPlatform,
			rateLimit,
			containers,
			status,
		}) => {
			const rawPasswordResetSessionToken = match(clientPlatform)
				.when(isWebPlatform, () => cookie[PASSWORD_RESET_SESSION_COOKIE_NAME].value)
				.when(isMobilePlatform, () => bodyPasswordResetSessionToken)
				.exhaustive();

			if (!rawPasswordResetSessionToken) {
				return status("Unauthorized", {
					code: "PASSWORD_RESET_SESSION_INVALID",
					message: "Password reset session token not found. Please request password reset again.",
				});
			}

			const passwordResetSessionToken = newPasswordResetSessionToken(rawPasswordResetSessionToken);

			const validationResult =
				await containers.auth.passwordResetValidateSessionUseCase.execute(passwordResetSessionToken);

			if (validationResult.isErr) {
				return match(validationResult)
					.with({ code: "PASSWORD_RESET_SESSION_INVALID" }, () =>
						status("Unauthorized", {
							code: "PASSWORD_RESET_SESSION_INVALID",
							message: "Invalid password reset session. Please request password reset again.",
						}),
					)
					.with({ code: "PASSWORD_RESET_SESSION_EXPIRED" }, () =>
						status("Unauthorized", {
							code: "PASSWORD_RESET_SESSION_EXPIRED",
							message: "Password reset session has expired. Please request password reset again.",
						}),
					)
					.exhaustive();
			}

			const { passwordResetSession } = validationResult.value;

			const ratelimitResult = await rateLimit.consume(passwordResetSession.id, 100);

			if (ratelimitResult.isErr) {
				return status("Too Many Requests", {
					code: "TOO_MANY_REQUESTS",
					message: "Too many requests. Please try again later.",
				});
			}

			const verifyEmailResult = await containers.auth.passwordResetVerifyEmailUseCase.execute(
				code,
				passwordResetSession,
			);

			if (verifyEmailResult.isErr) {
				return match(verifyEmailResult)
					.with({ code: "INVALID_VERIFICATION_CODE" }, () =>
						status("Bad Request", {
							code: "INVALID_VERIFICATION_CODE",
							message: "Invalid verification code. Please check your email and try again.",
						}),
					)
					.exhaustive();
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
				[PASSWORD_RESET_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				code: t.String(),
				passwordResetSessionToken: t.Optional(t.String()),
			}),
			detail: pathDetail({
				tag: "Auth - Password Reset",
				operationId: "auth-password-reset-verify",
				summary: "Password Reset Verify",
				description: "Password Reset Verify Code endpoint for the User",
			}),
		},
	);
