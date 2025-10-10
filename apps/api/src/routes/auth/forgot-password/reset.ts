import { t } from "elysia";
import { PasswordService } from "../../../application/services/password";
import { ResetPasswordUseCase, ValidatePasswordResetSessionUseCase } from "../../../application/use-cases/password";
import { PASSWORD_RESET_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from "../../../common/constants";
import { isErr } from "../../../common/utils";
import { newPasswordResetSessionToken } from "../../../domain/value-object";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { PasswordResetSessionRepository } from "../../../interface-adapter/repositories/password-reset-session";
import { SessionRepository } from "../../../interface-adapter/repositories/session";
import { UserRepository } from "../../../interface-adapter/repositories/user";
import { CookieManager } from "../../../modules/cookie";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../../modules/elysia-with-env";
import { BadRequestException, ForbiddenException, UnauthorizedException } from "../../../modules/error";
import { pathDetail } from "../../../modules/open-api";
import { WithClientTypeSchema, withClientType } from "../../../modules/with-client-type";

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
			const passwordService = new PasswordService(PASSWORD_PEPPER);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const userRepository = new UserRepository(drizzleService);
			const sessionRepository = new SessionRepository(drizzleService);
			const passwordResetSessionRepository = new PasswordResetSessionRepository(drizzleService);

			const validatePasswordResetSessionUseCase = new ValidatePasswordResetSessionUseCase(
				passwordResetSessionRepository,
				userRepository,
			);
			const resetPasswordUseCase = new ResetPasswordUseCase(
				userRepository,
				sessionRepository,
				passwordResetSessionRepository,
				passwordService,
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

			if (isErr(validationResult)) {
				const { code } = validationResult;

				switch (code) {
					case "PASSWORD_RESET_SESSION_INVALID":
						throw new UnauthorizedException({
							code: code,
							message: "Invalid password reset session. Please request password reset again.",
						});
					case "PASSWORD_RESET_SESSION_EXPIRED":
						throw new UnauthorizedException({
							code: code,
							message: "Password reset session has expired. Please request password reset again.",
						});
					default:
						throw new BadRequestException({
							code: code,
							message: "Password reset session validation failed. Please try again.",
						});
				}
			}

			const { passwordResetSession, user } = validationResult;

			const resetResult = await resetPasswordUseCase.execute(newPassword, passwordResetSession, user);

			if (isErr(resetResult)) {
				const { code } = resetResult;

				switch (code) {
					case "REQUIRED_EMAIL_VERIFICATION":
						throw new ForbiddenException({
							code: code,
							message: "Email verification is required before resetting password. Please verify your email first.",
						});
					default:
						throw new BadRequestException({
							code: code,
							message: "Password reset failed. Please try again.",
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
