import { Elysia } from "elysia";
import { toAccountConnectionsResponse } from "../../../features/auth";
import { authPlugin } from "../../../plugins/auth";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";

export const GetAccountConnections = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(authPlugin())

	// Route
	.get(
		"/",
		async ({ userIdentity, containers }) => {
			const result = await containers.auth.getConnectionsUseCase.execute(userIdentity);

			return toAccountConnectionsResponse(result);
		},
		{
			detail: pathDetail({
				operationId: "me-get-account-connections",
				summary: "Get Account Connections",
				description: "Get Account Authentication Connections endpoint for the User",
				tag: "Me",
				withAuth: true,
			}),
		},
	);
