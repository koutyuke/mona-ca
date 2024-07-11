import { AuthUseCase } from "@/application/usecases/auth";
import { UserUseCase } from "@/application/usecases/user";
import { UserCredentialsUseCase } from "@/application/usecases/userCredentials";
import { LuciaAdapter } from "@/interfaceAdapter/lucia";
import { UserRepository } from "@/interfaceAdapter/repositories/user";
import { UserCredentialsRepository } from "@/interfaceAdapter/repositories/userCredentials";
import { ElysiaWithEnv } from "@/modules/elysiaWithEnv";
import { errorResponseSchema } from "@/modules/error";
import { BadRequestException } from "@/modules/error/exceptions";
import { t } from "elysia";
import { Provider } from "./[provider]";

const Login = new ElysiaWithEnv({ prefix: "/login" })
	.post(
		"/",
		async ({ body: { email, password }, env: { APP_ENV }, cfModuleEnv: { DB } }) => {
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

			return {
				accessToken: session.id,
			};
		},
		{
			body: t.Object({
				email: t.String({
					format: "email",
				}),
				password: t.String(),
			}),
			response: {
				200: t.Object({
					accessToken: t.String(),
				}),
				400: errorResponseSchema,
			},
		},
	)
	.use(Provider);

export { Login };
