import { t } from "elysia";
import { PasswordService } from "../../../application/services/password";
import { SessionTokenService } from "../../../application/services/session-token";
import { ResetPasswordUseCase } from "../../../application/use-cases/password";
import { PASSWORD_RESET_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from "../../../common/constants";
import { FlattenUnion } from "../../../common/schema";
import { isErr } from "../../../common/utils";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { PasswordResetSessionRepository } from "../../../interface-adapter/repositories/password-reset-session";
import { SessionRepository } from "../../../interface-adapter/repositories/session";
import { UserRepository } from "../../../interface-adapter/repositories/user";
import { CookieService } from "../../../modules/cookie";
import { ElysiaWithEnv, NoContentResponse, NoContentResponseSchema } from "../../../modules/elysia-with-env";
import { BadRequestException, ErrorResponseSchema, InternalServerErrorResponseSchema } from "../../../modules/error";
import { pathDetail } from "../../../modules/open-api";
import { WithClientTypeSchema, withClientType } from "../../../modules/with-client-type";

const cookieSchemaObject = {
	[SESSION_COOKIE_NAME]: t.Optional(t.String()),
	[PASSWORD_RESET_SESSION_COOKIE_NAME]: t.Optional(t.String()),
};

export const ResetPassword = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(withClientType)

	// Route
	.post(
		"/reset",
		async ({
			cfModuleEnv: { DB },
			env: { PASSWORD_PEPPER, PASSWORD_RESET_SESSION_PEPPER, APP_ENV },
			cookie,
			body: { passwordResetSessionToken: bodyPasswordResetSessionToken, newPassword },
			clientType,
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const passwordService = new PasswordService(PASSWORD_PEPPER);
			const passwordResetSessionTokenService = new SessionTokenService(PASSWORD_RESET_SESSION_PEPPER);
			const cookieService = new CookieService(APP_ENV === "production", cookie, cookieSchemaObject);

			const userRepository = new UserRepository(drizzleService);
			const sessionRepository = new SessionRepository(drizzleService);
			const passwordResetSessionRepository = new PasswordResetSessionRepository(drizzleService);

			const resetPasswordUseCase = new ResetPasswordUseCase(
				passwordResetSessionRepository,
				userRepository,
				sessionRepository,
				passwordService,
				passwordResetSessionTokenService,
			);
			// === End of instances ===

			const passwordResetSessionToken =
				clientType === "web"
					? cookieService.getCookie(PASSWORD_RESET_SESSION_COOKIE_NAME)
					: bodyPasswordResetSessionToken;

			if (!passwordResetSessionToken) {
				throw new BadRequestException({
					code: "INVALID_TOKEN",
				});
			}

			const result = await resetPasswordUseCase.execute(passwordResetSessionToken, newPassword);

			if (isErr(result)) {
				const { code } = result;

				throw new BadRequestException({
					code,
				});
			}

			if (clientType === "web") {
				cookieService.deleteCookie(PASSWORD_RESET_SESSION_COOKIE_NAME);
			}

			return NoContentResponse();
			// This endpoint is not return. If return 200, redirect to login page.
		},
		{
			headers: WithClientTypeSchema.headers,
			cookie: t.Cookie(cookieSchemaObject),
			body: t.Object({
				newPassword: t.String(),
				passwordResetSessionToken: t.Optional(t.String()),
			}),
			response: {
				204: NoContentResponseSchema,
				400: FlattenUnion(
					WithClientTypeSchema.response[400],
					ErrorResponseSchema("INVALID_TOKEN"),
					ErrorResponseSchema("TOKEN_EXPIRED"),
					ErrorResponseSchema("EMAIL_NOT_VERIFIED"),
				),
				500: InternalServerErrorResponseSchema,
			},
			detail: pathDetail({
				tag: "Auth - Forgot Password",
				operationId: "auth-forgot-password-reset",
				summary: "Reset Password",
				description: "Reset Password endpoint for the User",
			}),
		},
	);
