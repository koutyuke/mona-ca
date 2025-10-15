import { t } from "elysia";
import { LogoutUseCase } from "../../application/use-cases/auth";
import { SESSION_COOKIE_NAME } from "../../common/constants";
import { DrizzleService } from "../../infrastructure/drizzle";
import { CookieManager } from "../../interface-adapter/http/cookie";
import { SessionRepository } from "../../interface-adapter/repositories/session";
import { AuthGuardSchema, authGuard } from "../../modules/auth-guard";
import {
	ElysiaWithEnv,
	NoContentResponse,
	NoContentResponseSchema,
	withBaseResponseSchema,
} from "../../modules/elysia-with-env";
import { pathDetail } from "../../modules/open-api";

export const Logout = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(
		authGuard({
			requireEmailVerification: false,
		}),
	)

	// Route
	.post(
		"/logout",
		async ({ env: { APP_ENV }, cfModuleEnv: { DB }, cookie, session, clientType }) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const sessionRepository = new SessionRepository(drizzleService);

			const logoutUseCase = new LogoutUseCase(sessionRepository);
			// === End of instances ===

			await logoutUseCase.execute(session.id);

			if (clientType === "web") {
				cookieManager.deleteCookie(SESSION_COOKIE_NAME);
			}

			return NoContentResponse();
		},
		{
			headers: AuthGuardSchema.headers,
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			response: withBaseResponseSchema({
				204: NoContentResponseSchema,
				400: AuthGuardSchema.response[400],
				401: AuthGuardSchema.response[401],
			}),
			detail: pathDetail({
				operationId: "auth-logout",
				summary: "Logout",
				description: "Logout from the application",
				tag: "Auth",
				withAuth: true,
			}),
		},
	);
