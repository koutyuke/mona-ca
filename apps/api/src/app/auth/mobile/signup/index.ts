import { AuthUseCase } from "@/application/usecases/auth";
import { UserUseCase } from "@/application/usecases/user";
import { LuciaAdapter } from "@/interfaceAdapter/lucia";
import { UserRepository } from "@/interfaceAdapter/repositories/user";
import { ElysiaWithEnv } from "@/modules/elysiaWithEnv";
import { errorResponseSchema } from "@/modules/error";
import { InternalServerError, t } from "elysia";
import { Provider } from "./[provider]";

const Signup = new ElysiaWithEnv({ prefix: "/signup" })
	.post(
		"/",
		async ({ body: { email, password, name }, env: { APP_ENV }, cfModuleEnv: { DB }, set }) => {
			const userUseCase = new UserUseCase(new UserRepository({ db: DB }));
			const authUseCase = new AuthUseCase(APP_ENV === "production", new LuciaAdapter({ db: DB }));

			try {
				const hashedPassword = await authUseCase.hashedPassword(password);

				const user = await userUseCase.createUser({
					name,
					email,
					emailVerified: false,
					iconUrl: null,
					hashedPassword,
				});

				const session = await authUseCase.createSession(user.id);

				set.status = 201;
				return {
					accessToken: session.id,
				};
			} catch (e) {
				console.error(e);
				throw new InternalServerError("Failed to create user");
			}
		},
		{
			body: t.Object({
				email: t.String({
					format: "email",
				}),
				password: t.String({
					minLength: 8,
					maxLength: 64,
				}),
				name: t.String({
					minLength: 3,
					maxLength: 32,
				}),
			}),
			response: {
				201: t.Object({
					accessToken: t.String(),
				}),
				500: errorResponseSchema,
			},
		},
	)
	.use(Provider);

export { Signup };
