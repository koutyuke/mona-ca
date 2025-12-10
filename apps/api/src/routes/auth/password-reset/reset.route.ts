import { PASSWORD_RESET_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from "@mona-ca/core/http";
import { Elysia, t } from "elysia";
import { match } from "ts-pattern";
import { isMobilePlatform, isWebPlatform } from "../../../core/domain/value-objects";
import { noContent } from "../../../core/infra/elysia";
import { newPasswordResetSessionToken } from "../../../features/auth";
import { clientPlatformPlugin } from "../../../plugins/client-platform";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";

export const PasswordResetResetRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(clientPlatformPlugin())

	// Route
	.post(
		"/reset",
		async ({
			cookie,
			body: { passwordResetSessionToken: bodyPasswordResetSessionToken, newPassword },
			clientPlatform,
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

			const { passwordResetSession, userCredentials } = validationResult.value;

			const resetResult = await containers.auth.passwordResetResetUseCase.execute(
				newPassword,
				passwordResetSession,
				userCredentials,
			);

			if (resetResult.isErr) {
				return match(resetResult)
					.with({ code: "REQUIRED_EMAIL_VERIFICATION" }, () =>
						status("Forbidden", {
							code: "REQUIRED_EMAIL_VERIFICATION",
							message: "Email verification is required before resetting password. Please verify your email first.",
						}),
					)
					.exhaustive();
			}

			if (isWebPlatform(clientPlatform)) {
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
				tag: "Auth - Password Reset",
				operationId: "auth-password-reset-reset",
				summary: "Reset Password",
				description: "Reset Password endpoint for the User",
			}),
		},
	);
