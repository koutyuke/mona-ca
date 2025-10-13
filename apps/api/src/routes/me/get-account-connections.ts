import { GetConnectionsUseCase } from "../../application/use-cases/account-link";
import { DrizzleService } from "../../infrastructure/drizzle";
import {
	AccountConnectionsPresenter,
	AccountConnectionsPresenterResultSchema,
} from "../../interface-adapter/presenters";
import { ExternalIdentityRepository } from "../../interface-adapter/repositories/external-identity";
import { UserRepository } from "../../interface-adapter/repositories/user";
import { AuthGuardSchema, authGuard } from "../../modules/auth-guard";
import { ElysiaWithEnv, withBaseResponseSchema } from "../../modules/elysia-with-env";
import { pathDetail } from "../../modules/open-api";

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

			return AccountConnectionsPresenter(result);
		},
		{
			headers: AuthGuardSchema.headers,
			response: withBaseResponseSchema({
				200: AccountConnectionsPresenterResultSchema,
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
