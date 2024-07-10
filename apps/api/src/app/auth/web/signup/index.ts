import { AuthUseCase } from "@/application/usecases/auth";
import { UserUseCase } from "@/application/usecases/user";
import { LuciaAdapter } from "@/interfaceAdapter/lucia";
import { UserRepository } from "@/interfaceAdapter/repositories/user";
import { ElysiaWithEnv } from "@/modules/elysiaWithEnv";
import { SESSION_COOKIE_NAME } from "@mona-ca/core/const";
import { InternalServerError, t } from "elysia";
import { Provider } from "./[provider]";

const Signup = new ElysiaWithEnv({ prefix: "/signup" })
	.post(
		"/",
		async ({ body: { email, password, name }, env: { APP_ENV }, cfModuleEnv: { DB }, set, cookie }) => {
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
				const sessionCookie = authUseCase.createSessionCookie(session.id);

				set.status = 201;
				cookie[SESSION_COOKIE_NAME]?.set({
					value: sessionCookie.value,
					...sessionCookie.attributes,
				});

				return null;
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
		},
	)
	.use(Provider);

export { Signup };
