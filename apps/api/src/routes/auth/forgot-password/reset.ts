import { t } from "elysia";
import { PasswordService } from "../../../application/services/password";
import { SessionTokenService } from "../../../application/services/session-token";
import { ResetPasswordUseCase } from "../../../application/use-cases/password";
import { SESSION_COOKIE_NAME } from "../../../common/constants";
import { FlattenUnion } from "../../../common/schema";
import { isErr } from "../../../common/utils";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { PasswordResetSessionRepository } from "../../../interface-adapter/repositories/password-reset-session";
import { SessionRepository } from "../../../interface-adapter/repositories/session";
import { UserRepository } from "../../../interface-adapter/repositories/user";
import { ElysiaWithEnv, NoContentResponse, NoContentResponseSchema } from "../../../modules/elysia-with-env";
import { BadRequestException, ErrorResponseSchema, InternalServerErrorResponseSchema } from "../../../modules/error";
import { pathDetail } from "../../../modules/open-api";

const cookieSchemaObject = {
	[SESSION_COOKIE_NAME]: t.Optional(t.String()),
};

export const ResetPassword = new ElysiaWithEnv()
	// Route
	.post(
		"/reset",
		async ({
			cfModuleEnv: { DB },
			env: { PASSWORD_PEPPER, SESSION_PEPPER },
			body: { passwordResetSessionToken, newPassword },
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const passwordService = new PasswordService(PASSWORD_PEPPER);
			const sessionTokenService = new SessionTokenService(SESSION_PEPPER);

			const userRepository = new UserRepository(drizzleService);
			const sessionRepository = new SessionRepository(drizzleService);
			const passwordResetSessionRepository = new PasswordResetSessionRepository(drizzleService);

			const resetPasswordUseCase = new ResetPasswordUseCase(
				passwordResetSessionRepository,
				userRepository,
				sessionRepository,
				passwordService,
				sessionTokenService,
			);
			// === End of instances ===

			const result = await resetPasswordUseCase.execute(passwordResetSessionToken, newPassword);

			if (isErr(result)) {
				const { code } = result;

				throw new BadRequestException({
					code,
				});
			}

			return NoContentResponse();
			// This endpoint is not return. If return 200, redirect to login page.
		},
		{
			cookie: t.Cookie(cookieSchemaObject),
			body: t.Object({
				passwordResetSessionToken: t.String(),
				newPassword: t.String(),
			}),
			response: {
				204: NoContentResponseSchema,
				400: FlattenUnion(
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
