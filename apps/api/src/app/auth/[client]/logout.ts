import { t } from "elysia";
import { LogoutUseCase } from "../../../application/use-cases/auth";
import { SESSION_COOKIE_NAME } from "../../../common/constants";
import { clientSchema } from "../../../common/schema";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { SessionRepository } from "../../../interface-adapter/repositories/session";
import { authGuard } from "../../../modules/auth-guard";
import { CookieService } from "../../../modules/cookie";
import { ElysiaWithEnv } from "../../../modules/elysia-with-env";
import { SessionTokenService } from "../../../services/session-token";

const cookieSchemaObject = {
	[SESSION_COOKIE_NAME]: t.Optional(t.String()),
};

export const Logout = new ElysiaWithEnv({
	prefix: "/logout",
})
	// Local Middleware & Plugin
	.use(
		authGuard({
			includeSessionToken: true,
		}),
	)

	// Route
	.post(
		"/",
		async ({ env: { SESSION_PEPPER, APP_ENV }, cfModuleEnv: { DB }, cookie, sessionToken, params: { client } }) => {
			const drizzleService = new DrizzleService(DB);
			const cookieService = new CookieService(APP_ENV === "production", cookie, cookieSchemaObject);
			const sessionTokenService = new SessionTokenService(SESSION_PEPPER);

			const sessionRepository = new SessionRepository(drizzleService);

			const logoutUseCase = new LogoutUseCase(sessionRepository, sessionTokenService);

			await logoutUseCase.execute(sessionToken);

			if (client === "web") {
				cookieService.deleteCookie(SESSION_COOKIE_NAME);
			}
			return null;
		},
		{
			cookie: t.Cookie(cookieSchemaObject),
			params: t.Object({
				client: clientSchema,
			}),
		},
	);
