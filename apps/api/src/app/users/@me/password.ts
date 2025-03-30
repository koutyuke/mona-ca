import { t } from "elysia";
import { PasswordService } from "../../../application/services/password";
import { SessionTokenService } from "../../../application/services/session-token";
import { UpdateUserPasswordUseCase } from "../../../application/use-cases/password";
import { isErr } from "../../../common/utils";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { SessionRepository } from "../../../interface-adapter/repositories/session";
import { UserRepository } from "../../../interface-adapter/repositories/user";
import { authGuard } from "../../../modules/auth-guard";
import { ElysiaWithEnv } from "../../../modules/elysia-with-env";
import { BadRequestException } from "../../../modules/error";

const Password = new ElysiaWithEnv({
	prefix: "/password",
})
	// Local Middleware & Plugin
	.use(authGuard())

	// Route
	.patch(
		"",
		async ({
			cfModuleEnv: { DB },
			env: { PASSWORD_PEPPER, SESSION_PEPPER },
			body: { currentPassword, newPassword },
			user,
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const passwordService = new PasswordService(PASSWORD_PEPPER);

			const userRepository = new UserRepository(drizzleService);
			const sessionRepository = new SessionRepository(drizzleService);
			const sessionTokenService = new SessionTokenService(SESSION_PEPPER);

			const updateUserPasswordUseCase = new UpdateUserPasswordUseCase(
				userRepository,
				sessionRepository,
				passwordService,
				sessionTokenService,
			);
			// === End of instances ===

			const result = await updateUserPasswordUseCase.execute(user, currentPassword, newPassword);

			if (isErr(result)) {
				const { code } = result;

				throw new BadRequestException({
					code,
				});
			}

			// TODO: Implement this.

			// const { session, sessionToken } = result;

			// if (client === "mobile") {
			// 	return {
			// 		sessionToken,
			// 	};
			// }

			// cookieService.setCookie(SESSION_COOKIE_NAME, sessionToken, {
			// 	expires: session.expiresAt,
			// });

			return;
		},
		{
			body: t.Object({
				currentPassword: t.Optional(t.String()),
				newPassword: t.String(),
			}),
		},
	);

export { Password };
