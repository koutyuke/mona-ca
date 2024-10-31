import { AuthUseCase } from "@/application/use-cases/auth";
import { UserUseCase } from "@/application/use-cases/user";
import { SESSION_COOKIE_NAME } from "@/common/constants";
import { Argon2idService } from "@/infrastructure/argon2id";
import { DrizzleService } from "@/infrastructure/drizzle";
import { SessionRepository } from "@/interface-adapter/repositories/session";
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
			const argon2idService = new Argon2idService();

			const sessionRepository = new SessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const userUseCase = new UserUseCase(userRepository);
			const authUseCase = new AuthUseCase(APP_ENV === "production", sessionRepository, argon2idService);

			try {
				const passwordHash = await authUseCase.hashPassword(password);

				const { user } = await userUseCase.createUser(
					{
						name,
						email,
						emailVerified: false,
						iconUrl: null,
						gender,
					},
					{
						credential: {
							passwordHash,
						},
					},
				);

				const sessionToken = authUseCase.generateSessionToken();
				const sessionCookie = authUseCase.createSessionCookie(sessionToken);
				await authUseCase.createSession(sessionToken, user.id);

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
