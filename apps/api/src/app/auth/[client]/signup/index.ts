import { SignupUseCase } from "@/application/use-cases/auth";
import { SESSION_COOKIE_NAME } from "@/common/constants";
import { DrizzleService } from "@/infrastructure/drizzle";
import { SessionRepository } from "@/interface-adapter/repositories/session";
import { UserRepository } from "@/interface-adapter/repositories/user";
import { UserCredentialRepository } from "@/interface-adapter/repositories/user-credential";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { CookieService } from "@/services/cookie";
import { PasswordService } from "@/services/password";
import { SessionTokenService } from "@/services/session-token";
import { t } from "elysia";
import { Provider } from "./[provider]";

const cookieSchemaObject = {
	[SESSION_COOKIE_NAME]: t.Optional(t.String()),
};

export const Signup = new ElysiaWithEnv({
	prefix: "/signup",
})
	// Other Route
	.use(Provider)

	// Route
	.post(
		"/",
		async ({
			env: { APP_ENV, PASSWORD_PEPPER, SESSION_PEPPER },
			cfModuleEnv: { DB },
			cookie,
			params: { client },
			body: { name, email, password, gender },
		}) => {
			const drizzleService = new DrizzleService(DB);
			const sessionTokenService = new SessionTokenService(SESSION_PEPPER);
			const cookieService = new CookieService(APP_ENV === "production", cookie, cookieSchemaObject);
			const passwordService = new PasswordService(PASSWORD_PEPPER);

			const sessionRepository = new SessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);
			const userCredentialRepository = new UserCredentialRepository(drizzleService);

			const singupUseCase = new SignupUseCase(
				sessionRepository,
				userRepository,
				userCredentialRepository,
				passwordService,
				sessionTokenService,
			);

			const { session, sessionToken } = await singupUseCase.execute(name, email, password, gender);

			if (client === "mobile") {
				return {
					sessionToken: sessionToken,
				};
			}

			cookieService.setCookie(SESSION_COOKIE_NAME, sessionToken, {
				expires: session.expiresAt,
			});

			return null;
		},
		{
			cookie: t.Cookie(cookieSchemaObject),
			params: t.Object({
				client: t.Union([t.Literal("web"), t.Literal("mobile")]),
			}),
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