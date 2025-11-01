import { Elysia, t } from "elysia";
import { noContent } from "../../core/infra/elysia";
import { SESSION_COOKIE_NAME } from "../../core/lib/http";
import { authPlugin } from "../../plugins/auth";
import { containerPlugin } from "../../plugins/container";
import { pathDetail } from "../../plugins/openapi";

export const Logout = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(
		authPlugin({
			requireEmailVerification: false,
		}),
	)

	// Route
	.post(
		"/logout",
		async ({ cookie, session, clientType, containers }) => {
			await containers.auth.logoutUseCase.execute(session.id);

			if (clientType === "web") {
				cookie[SESSION_COOKIE_NAME].remove();
			}

			return noContent();
		},
		{
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
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
