import { t } from "elysia";
import { SessionTokenService } from "../../application/services/session-token";
import { LogoutUseCase } from "../../application/use-cases/auth";
import { SESSION_COOKIE_NAME } from "../../common/constants";
import { DrizzleService } from "../../infrastructure/drizzle";
import { SessionRepository } from "../../interface-adapter/repositories/session";
import { AuthGuardSchema, authGuard } from "../../modules/auth-guard";
import { CookieManager } from "../../modules/cookie";
import { ElysiaWithEnv, NoContentResponse, NoContentResponseSchema } from "../../modules/elysia-with-env";
import { InternalServerErrorResponseSchema } from "../../modules/error";
import { pathDetail } from "../../modules/open-api";

export const Logout = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(
		authGuard({
			includeSessionToken: true,
			requireEmailVerification: false,
		}),
	)

	// Route
	.post(
		"/logout",
		async ({ env: { SESSION_PEPPER, APP_ENV }, cfModuleEnv: { DB }, cookie, sessionToken, clientType }) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);
			const sessionTokenService = new SessionTokenService(SESSION_PEPPER);

			const sessionRepository = new SessionRepository(drizzleService);

			const logoutUseCase = new LogoutUseCase(sessionRepository, sessionTokenService);
			// === End of instances ===

			await logoutUseCase.execute(sessionToken);

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
			response: {
				204: NoContentResponseSchema,
				400: AuthGuardSchema.response[400],
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
