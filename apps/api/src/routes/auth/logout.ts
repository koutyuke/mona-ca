import { t } from "elysia";
import { SessionTokenService } from "../../application/services/session-token";
import { LogoutUseCase } from "../../application/use-cases/auth";
import { SESSION_COOKIE_NAME } from "../../common/constants";
import { DrizzleService } from "../../infrastructure/drizzle";
import { SessionRepository } from "../../interface-adapter/repositories/session";
import { AuthGuardSchema, authGuard } from "../../modules/auth-guard";
import { CookieService } from "../../modules/cookie";
import { ElysiaWithEnv } from "../../modules/elysia-with-env";
import { InternalServerErrorResponseSchema } from "../../modules/error";
import { pathDetail } from "../../modules/open-api";
import { WithClientTypeSchema, withClientType } from "../../modules/with-client-type";

const cookieSchemaObject = {
	[SESSION_COOKIE_NAME]: t.Optional(t.String()),
};

export const Logout = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(withClientType)
	.use(
		authGuard({
			includeSessionToken: true,
		}),
	)

	// Route
	.post(
		"/logout",
		async ({ env: { SESSION_PEPPER, APP_ENV }, cfModuleEnv: { DB }, cookie, sessionToken, clientType, set }) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieService = new CookieService(APP_ENV === "production", cookie, cookieSchemaObject);
			const sessionTokenService = new SessionTokenService(SESSION_PEPPER);

			const sessionRepository = new SessionRepository(drizzleService);

			const logoutUseCase = new LogoutUseCase(sessionRepository, sessionTokenService);
			// === End of instances ===

			await logoutUseCase.execute(sessionToken);

			if (clientType === "web") {
				cookieService.deleteCookie(SESSION_COOKIE_NAME);
			}

			set.status = 204;
			return;
		},
		{
			headers: WithClientTypeSchema.header,
			cookie: t.Cookie(cookieSchemaObject),
			response: {
				204: t.Void(),
				400: WithClientTypeSchema.response[400],
				401: AuthGuardSchema.response[401],
				500: InternalServerErrorResponseSchema,
			},
			detail: pathDetail({
				operationId: "auth-logout",
				summary: "Logout",
				description: "Logout from the application",
				tag: "Auth",
				withAuth: true,
			}),
		},
	);
