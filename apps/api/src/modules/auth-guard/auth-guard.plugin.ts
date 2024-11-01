import { AuthUseCase } from "@/application/use-cases/auth";
import { Argon2idService } from "@/infrastructure/argon2id";
import { DrizzleService } from "@/infrastructure/drizzle";
import { SessionRepository } from "@/interface-adapter/repositories/session";
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
	}).derive(
		{ as: "scoped" },
		async ({ headers: { authorization }, env: { APP_ENV, SESSION_PEPPER }, cfModuleEnv: { DB }, cookie }) => {
			const drizzleService = new DrizzleService(DB);
			const sessionRepository = new SessionRepository(drizzleService);
			const argon2idService = new Argon2idService();

			const authUseCase = new AuthUseCase(APP_ENV === "production", sessionRepository, argon2idService);

			const sessionToken = authUseCase.readSessionCookie(cookie) || authUseCase.readBearerToken(authorization ?? "");

			if (!sessionToken) {
				throw new UnauthorizedException();
			}

			const validatedResult = await authUseCase.validateSessionToken(sessionToken, SESSION_PEPPER);

			if (!validatedResult) {
				throw new UnauthorizedException();
			}

			if (emailVerificationRequired && !validatedResult.user.emailVerified) {
				throw new UnauthorizedException({
					name: "EmailVerificationRequired",
					message: "Email verification is required.",
				});
			}

			return validatedResult;
		},
	);
};

export { authGuard };
