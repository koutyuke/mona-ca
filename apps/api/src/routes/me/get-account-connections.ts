import { Elysia } from "elysia";
import { AccountConnectionsResponseSchema, toAccountConnectionsResponse } from "../../features/auth";
import { AuthGuardSchema, authGuard } from "../../plugins/auth-guard";
import { di } from "../../plugins/di";
import { pathDetail } from "../../plugins/open-api";
import { withBaseResponseSchema } from "../../shared/infra/elysia";

export const GetAccountConnections = new Elysia()
	// Local Middleware & Plugin
	.use(di())
	.use(authGuard())

	// Route
	.get(
		"connections",
		async ({ userIdentity, containers }) => {
			const result = await containers.auth.getConnectionsUseCase.execute(userIdentity);

			return toAccountConnectionsResponse(result);
		},
		{
			headers: AuthGuardSchema.headers,
			response: withBaseResponseSchema({
				200: AccountConnectionsResponseSchema,
				400: AuthGuardSchema.response[400],
				401: AuthGuardSchema.response[401],
			}),
			detail: pathDetail({
				operationId: "me-get-account-connections",
				summary: "Get Account Connections",
				description: "Get Account Authentication Connections endpoint for the User",
				tag: "Me",
				withAuth: true,
			}),
		},
	);
