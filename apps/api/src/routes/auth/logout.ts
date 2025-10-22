import { Elysia, t } from "elysia";
import { AuthGuardSchema, authGuard } from "../../plugins/auth-guard";
import { di } from "../../plugins/di";
import { pathDetail } from "../../plugins/open-api";
import { env } from "../../shared/infra/config/env";
import {
	CookieManager,
	NoContentResponse,
	NoContentResponseSchema,
	withBaseResponseSchema,
} from "../../shared/infra/elysia";
import { SESSION_COOKIE_NAME } from "../../shared/lib/http";

export const Logout = new Elysia()
	// Local Middleware & Plugin
	.use(di())
	.use(
		authGuard({
			requireEmailVerification: false,
		}),
	)

	// Route
	.post(
		"/logout",
		async ({ cookie, session, clientType, containers }) => {
			const cookieManager = new CookieManager(env.APP_ENV === "production", cookie);

			await containers.auth.logoutUseCase.execute(session.id);

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
