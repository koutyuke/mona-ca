import { AuthUseCase } from "@/application/use-cases/auth";
import { SESSION_COOKIE_NAME } from "@/common/constants";
import { Argon2idService } from "@/infrastructure/argon2id";
import { DrizzleService } from "@/infrastructure/drizzle";
import { SessionRepository } from "@/interface-adapter/repositories/session";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { InternalServerErrorException } from "@/modules/error/exceptions";
import { t } from "elysia";

const Logout = new ElysiaWithEnv({
	prefix: "/logout",
})
	// Route
	.post(
		"/",
		async ({ env: { APP_ENV, SESSION_PEPPER }, cfModuleEnv: { DB }, cookie }) => {
			const drizzleService = new DrizzleService(DB);
			const argon2idService = new Argon2idService();

			const sessionRepository = new SessionRepository(drizzleService);

			const authUseCase = new AuthUseCase(APP_ENV === "production", sessionRepository, argon2idService);

			const sessionCookie = cookie[SESSION_COOKIE_NAME];

			const sessionToken = sessionCookie.value;

			if (!sessionToken) {
				return null;
			}

			const sessionId = authUseCase.hashToken(sessionToken, SESSION_PEPPER);

			try {
				await authUseCase.invalidateSession(sessionId);
				const blankSessionCookie = authUseCase.createBlankSessionCookie();

				sessionCookie.set({
					value: blankSessionCookie.value,
					...blankSessionCookie.attributes,
				});
			} catch (error) {
				console.error(error);
				throw new InternalServerErrorException({
					message: "Failed to logout",
				});
			}
			return null;
		},
		{
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.String(),
			}),
		},
	);

export { Logout };
