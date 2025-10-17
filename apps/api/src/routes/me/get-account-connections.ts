import {
	AccountConnectionsResponseSchema,
	toAccountConnectionsResponse,
} from "../../features/auth/adapters/presenters";
import { ExternalIdentityRepository } from "../../features/auth/adapters/repositories/external-identity";
import { GetConnectionsUseCase } from "../../features/auth/application/use-cases/account-link";
import { UserRepository } from "../../features/user/adapters/repositories/user";
import { DrizzleService } from "../../infrastructure/drizzle";
import { AuthGuardSchema, authGuard } from "../../plugins/auth-guard";
import { ElysiaWithEnv, withBaseResponseSchema } from "../../plugins/elysia-with-env";
import { pathDetail } from "../../plugins/open-api";

export const GetAccountConnections = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(authGuard())

	// Route
	.get(
		"connections",
		async ({ cfModuleEnv: { DB }, user }) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);

			const userRepository = new UserRepository(drizzleService);
			const externalIdentityRepository = new ExternalIdentityRepository(drizzleService);

			const getConnectionsUseCase = new GetConnectionsUseCase(externalIdentityRepository, userRepository);

			const result = await getConnectionsUseCase.execute(user.id);

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
