import { AuthUseCase } from "@/application/use-cases/auth";
import { LuciaAdapter } from "@/infrastructure/lucia";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { BadRequestException } from "@/modules/error/exceptions";
import { t } from "elysia";

const Logout = new ElysiaWithEnv().post(
	"/logout",
	async ({ headers: { authorization }, env: { APP_ENV }, cfModuleEnv: { DB }, set }) => {
		const authUseCase = new AuthUseCase(APP_ENV === "production", new LuciaAdapter({ db: DB }));

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
