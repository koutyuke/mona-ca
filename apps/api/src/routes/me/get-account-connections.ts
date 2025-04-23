import { t } from "elysia";
import { GetConnectionsUseCase } from "../../application/use-cases/account-link";
import { isErr } from "../../common/utils";
import { DrizzleService } from "../../infrastructure/drizzle";
import { OAuthAccountRepository } from "../../interface-adapter/repositories/oauth-account";
import { UserRepository } from "../../interface-adapter/repositories/user";
import { AuthGuardSchema, authGuard } from "../../modules/auth-guard";
import { ElysiaWithEnv } from "../../modules/elysia-with-env";
import { BadRequestException, InternalServerErrorResponseSchema } from "../../modules/error";
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
			const oauthAccountRepository = new OAuthAccountRepository(drizzleService);

			const getConnectionsUseCase = new GetConnectionsUseCase(oauthAccountRepository, userRepository);

			const result = await getConnectionsUseCase.execute(user.id);

			if (isErr(result)) {
				throw new BadRequestException({ code: result.code });
			}

			return result;
		},
		{
			headers: AuthGuardSchema.headers,
			response: {
				200: t.Mapped(t.Union([t.Literal("discord")]), () =>
					t.Nullable(
						t.Object({
							provider: t.String(),
							providerId: t.String(),
							linkedAt: t.Date(),
						}),
					),
				),
				400: AuthGuardSchema.response[400],
				401: AuthGuardSchema.response[401],
				500: InternalServerErrorResponseSchema,
			},
			detail: pathDetail({
				operationId: "me-get-account-connections",
				summary: "Get Account Connections",
				description: "Get Account Authentication Connections endpoint for the User",
				tag: "Me",
				withAuth: true,
			}),
		},
	);
