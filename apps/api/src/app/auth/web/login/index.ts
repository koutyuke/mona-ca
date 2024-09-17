import { AuthUseCase } from "@/application/use-cases/auth";
import { UserUseCase } from "@/application/use-cases/user";
import { UserCredentialsUseCase } from "@/application/use-cases/user-credentials";
import { LuciaAdapter } from "@/infrastructure/lucia";
import { UserRepository } from "@/interface-adapter/repositories/user";
import { UserCredentialsRepository } from "@/interface-adapter/repositories/user-credentials";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { BadRequestException } from "@/modules/error/exceptions";
import { SESSION_COOKIE_NAME } from "@mona-ca/core/const";
import { t } from "elysia";
import { Provider } from "./[provider]";

const Login = new ElysiaWithEnv({ prefix: "/login" })
	.post(
		"/",
		async ({ body: { email, password }, env: { APP_ENV }, cfModuleEnv: { DB }, cookie }) => {
			const userUseCase = new UserUseCase(new UserRepository({ db: DB }));
			const authUseCase = new AuthUseCase(APP_ENV === "production", new LuciaAdapter({ db: DB }));
			const userCredentialsUseCase = new UserCredentialsUseCase(new UserCredentialsRepository({ db: DB }));

			const user = await userUseCase.findUserByEmail(email);
			const credentials = user ? await userCredentialsUseCase.findCredentialsByUserId(user.id) : null;

			if (
				!user ||
				!credentials ||
				!credentials.hashedPassword ||
				!authUseCase.verifyHashedPassword(password, credentials.hashedPassword)
			) {
				throw new BadRequestException({
					message: "Email or Password is incorrect",
				});
			}

			const session = await authUseCase.createSession(user.id);
			const sessionCookie = authUseCase.createSessionCookie(session.id);

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
	)
	.use(Provider);

export { Login };
