import { t } from "elysia";
import { PasswordService } from "../../../../application/services/password";
import { SessionTokenService } from "../../../../application/services/session-token";
import { ResetPasswordUseCase } from "../../../../application/use-cases/password";
import { SESSION_COOKIE_NAME } from "../../../../common/constants";
import { clientSchema } from "../../../../common/schema";
import { isErr } from "../../../../common/utils";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { PasswordResetSessionRepository } from "../../../../interface-adapter/repositories/password-reset-session";
import { SessionRepository } from "../../../../interface-adapter/repositories/session";
import { UserRepository } from "../../../../interface-adapter/repositories/user";
import { ElysiaWithEnv } from "../../../../modules/elysia-with-env";
import { BadRequestException } from "../../../../modules/error";

const cookieSchemaObject = {
	[SESSION_COOKIE_NAME]: t.Optional(t.String()),
};

const Reset = new ElysiaWithEnv({
	prefix: "/reset",
})
	// Route
	.post(
		"/",
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

			// This endpoint is not return. If return 200, redirect to login page.
		},
		{
			cookie: t.Cookie(cookieSchemaObject),
			params: t.Object({
				client: clientSchema,
			}),
			body: t.Object({
				passwordResetSessionToken: t.String(),
				newPassword: t.String(),
			}),
		},
	);

export { Reset };
