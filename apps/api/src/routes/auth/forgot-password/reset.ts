import { t } from "elysia";
import { ResetPasswordUseCase, ValidatePasswordResetSessionUseCase } from "../../../features/auth";
import { AuthUserRepository } from "../../../features/auth/adapters/repositories/auth-user/auth-user.repository";
import { PasswordResetSessionRepository } from "../../../features/auth/adapters/repositories/password-reset-session/password-reset-session.repository";
import { SessionRepository } from "../../../features/auth/adapters/repositories/session/session.repository";
import { newPasswordResetSessionToken } from "../../../features/auth/domain/value-objects/session-token";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../../plugins/elysia-with-env";
import { ForbiddenException, UnauthorizedException } from "../../../plugins/error";
import { pathDetail } from "../../../plugins/open-api";
import { WithClientTypeSchema, withClientType } from "../../../plugins/with-client-type";
import { PasswordHasher, SessionSecretHasher } from "../../../shared/infra/crypto";
import { DrizzleService } from "../../../shared/infra/drizzle";
import { CookieManager } from "../../../shared/infra/elysia/cookie";
import { PASSWORD_RESET_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from "../../../shared/lib/http";

export const ResetPassword = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(withClientType)

	// Route
	.post(
		"/reset",
		async ({
			cfModuleEnv: { DB },
			env: { PASSWORD_PEPPER, APP_ENV },
			cookie,
			body: { passwordResetSessionToken: bodyPasswordResetSessionToken, newPassword },
			clientType,
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const authUserRepository = new AuthUserRepository(drizzleService);
			const sessionRepository = new SessionRepository(drizzleService);
			const passwordResetSessionRepository = new PasswordResetSessionRepository(drizzleService);

			const sessionSecretHasher = new SessionSecretHasher();
			const passwordHasher = new PasswordHasher(PASSWORD_PEPPER);

			const validatePasswordResetSessionUseCase = new ValidatePasswordResetSessionUseCase(
				passwordResetSessionRepository,
				authUserRepository,
				sessionSecretHasher,
			);
			const resetPasswordUseCase = new ResetPasswordUseCase(
				authUserRepository,
				sessionRepository,
				passwordResetSessionRepository,
				passwordHasher,
			);
			// === End of instances ===

			const rawPasswordResetSessionToken =
				clientType === "web"
					? cookieManager.getCookie(PASSWORD_RESET_SESSION_COOKIE_NAME)
					: bodyPasswordResetSessionToken;

			if (!rawPasswordResetSessionToken) {
				throw new UnauthorizedException({
					code: "PASSWORD_RESET_SESSION_INVALID",
					message: "Password reset session token not found. Please request password reset again.",
				});
			}

			const validationResult = await validatePasswordResetSessionUseCase.execute(
				newPasswordResetSessionToken(rawPasswordResetSessionToken),
			);

			if (validationResult.isErr) {
				const { code } = validationResult;

				if (code === "PASSWORD_RESET_SESSION_INVALID") {
					throw new UnauthorizedException({
						code: code,
						message: "Invalid password reset session. Please request password reset again.",
					});
				}
				if (code === "PASSWORD_RESET_SESSION_EXPIRED") {
					throw new UnauthorizedException({
						code: code,
						message: "Password reset session has expired. Please request password reset again.",
					});
				}
			}

			const { passwordResetSession, userIdentity } = validationResult.value;

			const resetResult = await resetPasswordUseCase.execute(newPassword, passwordResetSession, userIdentity);

			if (resetResult.isErr) {
				const { code } = resetResult;

				if (code === "REQUIRED_EMAIL_VERIFICATION") {
					throw new ForbiddenException({
						code: code,
						message: "Email verification is required before resetting password. Please verify your email first.",
					});
				}
			}

			if (clientType === "web") {
				cookieManager.deleteCookie(PASSWORD_RESET_SESSION_COOKIE_NAME);
			}

			return NoContentResponse();
			// This endpoint is not return. If return 200, redirect to login page.
		},
		{
			headers: WithClientTypeSchema.headers,
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
				[PASSWORD_RESET_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				newPassword: t.String(),
				passwordResetSessionToken: t.Optional(t.String()),
			}),
			response: withBaseResponseSchema({
				204: NoContentResponseSchema,
				400: WithClientTypeSchema.response[400],
				401: ResponseTUnion(
					ErrorResponseSchema("PASSWORD_RESET_SESSION_INVALID"),
					ErrorResponseSchema("PASSWORD_RESET_SESSION_EXPIRED"),
				),
				403: ErrorResponseSchema("REQUIRED_EMAIL_VERIFICATION"),
			}),
			detail: pathDetail({
				tag: "Auth - Forgot Password",
				operationId: "auth-forgot-password-reset",
				summary: "Reset Password",
				description: "Reset Password endpoint for the User",
			}),
		},
	);
