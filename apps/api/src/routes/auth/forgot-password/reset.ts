import { Elysia, t } from "elysia";
import { noContent } from "../../../core/infra/elysia";
import { PASSWORD_RESET_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from "../../../core/lib/http";
import { newPasswordResetSessionToken } from "../../../features/auth";
import { clientTypePlugin } from "../../../plugins/client-type";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";

export const ResetPassword = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(clientTypePlugin())

	// Route
	.post(
		"/reset",
		async ({
			cookie,
			body: { passwordResetSessionToken: bodyPasswordResetSessionToken, newPassword },
			clientType,
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

			const { passwordResetSession, userIdentity } = validationResult.value;

			const resetResult = await containers.auth.resetPasswordUseCase.execute(
				newPassword,
				passwordResetSession,
				userIdentity,
			);

			if (resetResult.isErr) {
				const { code } = resetResult;

				if (code === "REQUIRED_EMAIL_VERIFICATION") {
					return status("Forbidden", {
						code: code,
						message: "Email verification is required before resetting password. Please verify your email first.",
					});
				}
			}

			if (clientType === "web") {
				cookie[PASSWORD_RESET_SESSION_COOKIE_NAME].remove();
			}

			return noContent();
			// This endpoint is not return. If return 200, redirect to login page.
		},
		{
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
				[PASSWORD_RESET_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				newPassword: t.String(),
				passwordResetSessionToken: t.Optional(t.String()),
			}),
			detail: pathDetail({
				tag: "Auth - Forgot Password",
				operationId: "auth-forgot-password-reset",
				summary: "Reset Password",
				description: "Reset Password endpoint for the User",
			}),
		},
	);
