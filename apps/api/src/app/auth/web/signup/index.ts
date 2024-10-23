import { AuthUseCase } from "@/application/use-cases/auth";
import { UserUseCase } from "@/application/use-cases/user";
import { SESSION_COOKIE_NAME } from "@/common/constants";
import { DrizzleService } from "@/infrastructure/drizzle";
import { LuciaAdapter } from "@/infrastructure/lucia";
import { UserRepository } from "@/interface-adapter/repositories/user";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { InternalServerError, t } from "elysia";
import { Provider } from "./[provider]";

const Signup = new ElysiaWithEnv({ prefix: "/signup" })
	// Other Route
	.use(Provider)

	// Route
	.post(
		"/",
		async ({ body: { email, password, name, gender }, env: { APP_ENV }, cfModuleEnv: { DB }, set, cookie }) => {
			const drizzleService = new DrizzleService(DB);

			const userUseCase = new UserUseCase(new UserRepository(drizzleService));
			const authUseCase = new AuthUseCase(APP_ENV === "production", new LuciaAdapter(drizzleService));

			try {
				const hashedPassword = await authUseCase.hashedPassword(password);

				const user = await userUseCase.createUser({
					name,
					email,
					emailVerified: false,
					iconUrl: null,
					gender,
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
				gender: t.Union([t.Literal("man"), t.Literal("woman")]),
			}),
		},
	);

export { Signup };
