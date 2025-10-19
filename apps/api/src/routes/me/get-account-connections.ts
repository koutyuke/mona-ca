import { GetConnectionsUseCase } from "../../features/auth";
import {
	AccountConnectionsResponseSchema,
	toAccountConnectionsResponse,
} from "../../features/auth/adapters/presenters/account-connections.presenter";
import { ExternalIdentityRepository } from "../../features/auth/adapters/repositories/external-identity/external-identity.repository";
import { AuthGuardSchema, authGuard } from "../../plugins/auth-guard";
import { ElysiaWithEnv, withBaseResponseSchema } from "../../plugins/elysia-with-env";
import { pathDetail } from "../../plugins/open-api";
import { DrizzleService } from "../../shared/infra/drizzle";

export const GetAccountConnections = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(authGuard())

	// Route
	.get(
		"connections",
		async ({ cfModuleEnv: { DB }, userIdentity }) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);

			const externalIdentityRepository = new ExternalIdentityRepository(drizzleService);

			const getConnectionsUseCase = new GetConnectionsUseCase(externalIdentityRepository);

			const result = await getConnectionsUseCase.execute(userIdentity);

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
