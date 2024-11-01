import { AuthUseCase } from "@/application/use-cases/auth";
import { UserUseCase } from "@/application/use-cases/user";
import { UserCredentialUseCase } from "@/application/use-cases/user-credential";
import { SESSION_COOKIE_NAME } from "@/common/constants";
import { Argon2idService } from "@/infrastructure/argon2id";
import { DrizzleService } from "@/infrastructure/drizzle";
import { SessionRepository } from "@/interface-adapter/repositories/session";
import { UserRepository } from "@/interface-adapter/repositories/user";
import { UserCredentialRepository } from "@/interface-adapter/repositories/user-credential";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { BadRequestException } from "@/modules/error/exceptions";
import { t } from "elysia";
import { Provider } from "./[provider]";

const Login = new ElysiaWithEnv({ prefix: "/login" })
	// Other Route
	.use(Provider)

	// Route
	.post(
		"/",
		async ({ body: { email, password }, env: { APP_ENV }, cfModuleEnv: { DB }, cookie }) => {
			const drizzleService = new DrizzleService(DB);
			const argon2idService = new Argon2idService();

			const sessionRepository = new SessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);
			const userCredentialRepository = new UserCredentialRepository(drizzleService);

			const userUseCase = new UserUseCase(userRepository);
			const authUseCase = new AuthUseCase(APP_ENV === "production", sessionRepository, argon2idService);
			const userCredentialsUseCase = new UserCredentialUseCase(userCredentialRepository);

			const user = await userUseCase.getUserByEmail(email);
			const credentials = user ? await userCredentialsUseCase.getUserCredential(user.id) : null;

			if (
				!user ||
				!credentials ||
				!credentials.passwordHash ||
				!authUseCase.verifyPasswordHash(password, credentials.passwordHash)
			) {
				throw new BadRequestException({
					message: "Email or Password is incorrect",
				});
			}

			const sessionToken = authUseCase.generateSessionToken();

			await authUseCase.createSession(sessionToken, user.id);

			const sessionCookie = authUseCase.createSessionCookie(sessionToken);

			cookie[SESSION_COOKIE_NAME]?.set({
				value: sessionCookie.value,
				...sessionCookie.attributes,
			});

			return null;
		},
		{
			body: t.Object({
				email: t.String({
					format: "email",
				}),
				password: t.String(),
			}),
		},
	);

export { Login };
