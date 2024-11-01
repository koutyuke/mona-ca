import { AuthUseCase } from "@/application/use-cases/auth";
import { Argon2idService } from "@/infrastructure/argon2id";
import { DrizzleService } from "@/infrastructure/drizzle";
import { SessionRepository } from "@/interface-adapter/repositories/session";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { BadRequestException } from "@/modules/error/exceptions";
import { t } from "elysia";

const Logout = new ElysiaWithEnv({
	prefix: "/logout",
})
	// Route
	.post(
		"/",
		async ({ headers: { authorization }, env: { APP_ENV, SESSION_PEPPER }, cfModuleEnv: { DB }, set }) => {
			const drizzleService = new DrizzleService(DB);
			const argon2idService = new Argon2idService();

			const sessionRepository = new SessionRepository(drizzleService);

			const authUseCase = new AuthUseCase(APP_ENV === "production", sessionRepository, argon2idService);

			const sessionToken = authUseCase.readBearerToken(authorization);

			if (!sessionToken) {
				throw new BadRequestException({
					message: "Parameter is invalid",
				});
			}

			const sessionId = authUseCase.hashToken(sessionToken, SESSION_PEPPER);

			await authUseCase.invalidateSession(sessionId);
			set.status = 204;
			return null;
		},
		{
			headers: t.Object({
				authorization: t.String(),
			}),
		},
	);

export { Logout };
