import { AuthUseCase } from "@/application/use-cases/auth";
import { LuciaAdapter } from "@/infrastructure/lucia";
import { ElysiaWithEnv } from "../elysia-with-env";
import { UnauthorizedException } from "../error/exceptions";

const authGuard = new ElysiaWithEnv({
	name: "@mona-ca/auth",
}).derive({ as: "scoped" }, async ({ headers: { authorization }, env: { APP_ENV }, cfModuleEnv: { DB }, cookie }) => {
	const authUseCase = new AuthUseCase(APP_ENV === "production", new LuciaAdapter({ db: DB }));

	const sessionToken = authUseCase.readSessionCookie(cookie) || authUseCase.readBearerToken(authorization ?? "");

	if (!sessionToken) {
		throw new UnauthorizedException();
	}

	const sessionInfo = await authUseCase.validateSession(sessionToken);

	if (!sessionInfo) {
		throw new UnauthorizedException();
	}

	return sessionInfo;
});

export { authGuard };
