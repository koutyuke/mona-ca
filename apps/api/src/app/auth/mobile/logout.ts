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
		async ({ headers: { authorization }, env: { APP_ENV }, cfModuleEnv: { DB }, set }) => {
			const drizzleService = new DrizzleService(DB);
			const argon2idService = new Argon2idService();

			const sessionRepository = new SessionRepository(drizzleService);

			const authUseCase = new AuthUseCase(APP_ENV === "production", sessionRepository, argon2idService);

			const sessionId = authUseCase.readBearerToken(authorization);

			if (!sessionId) {
				throw new BadRequestException({
					message: "Parameter is invalid",
				});
			}

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
