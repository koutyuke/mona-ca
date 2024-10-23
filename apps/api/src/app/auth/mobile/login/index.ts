import { AuthUseCase } from "@/application/use-cases/auth";
import { UserUseCase } from "@/application/use-cases/user";
import { UserCredentialsUseCase } from "@/application/use-cases/user-credentials";
import { DrizzleService } from "@/infrastructure/drizzle";
import { LuciaAdapter } from "@/infrastructure/lucia";
import { UserRepository } from "@/interface-adapter/repositories/user";
import { UserCredentialsRepository } from "@/interface-adapter/repositories/user-credentials";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { errorResponseSchema } from "@/modules/error";
import { BadRequestException } from "@/modules/error/exceptions";
import { t } from "elysia";
import { Provider } from "./[provider]";

const Login = new ElysiaWithEnv({ prefix: "/login" })
	// Other Route
	.use(Provider)

	// Route
	.post(
		"/",
		async ({ body: { email, password }, env: { APP_ENV }, cfModuleEnv: { DB } }) => {
			const drizzleService = new DrizzleService(DB);

			const userUseCase = new UserUseCase(new UserRepository(drizzleService));
			const authUseCase = new AuthUseCase(APP_ENV === "production", new LuciaAdapter(drizzleService));
			const userCredentialsUseCase = new UserCredentialsUseCase(new UserCredentialsRepository(drizzleService));

			const user = await userUseCase.getUserByEmail(email);
			const credentials = user ? await userCredentialsUseCase.getUserCredential(user.id) : null;

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
	);

export { Login };
