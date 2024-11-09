import { LoginUseCase } from "@/application/use-cases/auth";
import { SESSION_COOKIE_NAME } from "@/common/constants";
import { clientSchema } from "@/common/schema";
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

export const Login = new ElysiaWithEnv({
	prefix: "/login",
})
	// Other Route
	.use(Provider)

	// Route
	.post(
		"/",
		async ({
			env: { SESSION_PEPPER, APP_ENV, PASSWORD_PEPPER },
			cfModuleEnv: { DB },
			cookie,
			params: { client },
			body: { email, password },
		}) => {
			const drizzleService = new DrizzleService(DB);
			const cookieService = new CookieService(APP_ENV === "production", cookie, cookieSchemaObject);
			const sessionTokenService = new SessionTokenService(SESSION_PEPPER);
			const passwordService = new PasswordService(PASSWORD_PEPPER);

			const sessionRepository = new SessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);
			const userCredentialRepository = new UserCredentialRepository(drizzleService);

			const loginUseCase = new LoginUseCase(
				sessionRepository,
				userRepository,
				userCredentialRepository,
				passwordService,
				sessionTokenService,
			);

			const { session, sessionToken } = await loginUseCase.execute(email, password);

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
				client: clientSchema,
			}),
			body: t.Object({
				email: t.String({
					format: "email",
				}),
				password: t.String(),
			}),
		},
	);
