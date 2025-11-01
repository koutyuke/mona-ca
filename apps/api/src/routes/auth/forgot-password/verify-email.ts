import { Elysia, t } from "elysia";
import { noContent } from "../../../core/infra/elysia";
import { PASSWORD_RESET_SESSION_COOKIE_NAME } from "../../../core/lib/http";
import { newPasswordResetSessionToken } from "../../../features/auth";
import { clientTypePlugin } from "../../../plugins/client-type";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";
import { ratelimitPlugin } from "../../../plugins/ratelimit";

export const PasswordResetVerifyEmail = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(clientTypePlugin())
	.use(
		ratelimitPlugin("forgot-password-verify-email", {
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
		"/verify-email",
		async ({
			cookie,
			body: { passwordResetSessionToken: bodyPasswordResetSessionToken, code },
			clientType,
			rateLimit,
			containers,
			status,
		}) => {
			const rawPasswordResetSessionToken =
				clientType === "web" ? cookie[PASSWORD_RESET_SESSION_COOKIE_NAME].value : bodyPasswordResetSessionToken;

			if (!rawPasswordResetSessionToken) {
				return status("Unauthorized", {
					code: "PASSWORD_RESET_SESSION_INVALID",
					message: "Password reset session token not found. Please request password reset again.",
				});
			}

			const validationResult = await containers.auth.validatePasswordResetSessionUseCase.execute(
				newPasswordResetSessionToken(rawPasswordResetSessionToken),
			);

			if (validationResult.isErr) {
				const { code } = validationResult;

				if (code === "PASSWORD_RESET_SESSION_INVALID") {
					return status("Unauthorized", {
						code: code,
						message: "Invalid password reset session. Please request password reset again.",
					});
				}
				if (code === "PASSWORD_RESET_SESSION_EXPIRED") {
					return status("Unauthorized", {
						code: code,
						message: "Password reset session has expired. Please request password reset again.",
					});
				}
			}

			const { passwordResetSession } = validationResult.value;

			await rateLimit.consume(passwordResetSession.id, 100);

			const verifyEmailResult = await containers.auth.passwordResetVerifyEmailUseCase.execute(
				code,
				passwordResetSession,
			);

			if (verifyEmailResult.isErr) {
				const { code } = verifyEmailResult;

				if (code === "INVALID_VERIFICATION_CODE") {
					return status("Bad Request", {
						code: code,
						message: "Invalid verification code. Please check your email and try again.",
					});
				}
			}

			return noContent();
		},
		{
			cookie: t.Cookie({
				[PASSWORD_RESET_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				code: t.String(),
				passwordResetSessionToken: t.Optional(t.String()),
			}),
			detail: pathDetail({
				tag: "Auth - Forgot Password",
				operationId: "auth-forgot-password-verify-email",
				summary: "Password Reset Verify Email",
				description: "Password Reset Verify Email endpoint for the User",
			}),
		},
	);
