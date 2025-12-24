import { SESSION_COOKIE_NAME } from "@mona-ca/core/http";
import { Elysia } from "elysia";
import { isWebPlatform } from "../../core/domain/value-objects";
import { noContent } from "../../core/infra/elysia";
import { authPlugin } from "../../plugins/auth";
import { containerPlugin } from "../../plugins/container";
import { pathDetail } from "../../plugins/openapi";

export const LogoutRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(
		authPlugin({
			withEmailVerification: false,
		}),
	)

	// Route
	.post(
		"/logout",
		async ({ cookie, session, clientPlatform, containers }) => {
			await containers.auth.logoutUseCase.execute(session.id);

			if (isWebPlatform(clientPlatform)) {
				cookie[SESSION_COOKIE_NAME].remove();
			}

			return noContent();
		},
		{
			detail: pathDetail({
				operationId: "auth-logout",
				summary: "Logout",
				description: "Logout from the application",
				tag: "Auth",
				withAuth: true,
			}),
		},
	);
