import { AuthUseCase } from "@/application/use-cases/auth";
import { LuciaAdapter } from "@/infrastructure/lucia";
import { ElysiaWithEnv } from "../elysia-with-env";
import { UnauthorizedException } from "../error/exceptions";

type AuthGuardOptions = {
	emailVerificationRequired?: boolean;
};

const authGuard = (options?: AuthGuardOptions) => {
	const { emailVerificationRequired = true } = options ?? {};

	return new ElysiaWithEnv({
		name: "@mona-ca/auth",
		seed: {
			emailVerificationRequired,
		},
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

		if (emailVerificationRequired && !sessionInfo.user.emailVerified) {
			throw new UnauthorizedException({
				name: "EmailVerificationRequired",
				message: "Email verification is required.",
			});
		}

		return sessionInfo;
	});
};

export { authGuard };
