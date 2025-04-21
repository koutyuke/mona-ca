import { t } from "elysia";
import { UnlinkAccountConnectionUseCase } from "../../application/use-cases/account-link";
import { FlattenUnion } from "../../common/schemas";
import { isErr } from "../../common/utils";
import { newOAuthProvider, oauthProviderSchema } from "../../domain/value-object";
import { DrizzleService } from "../../infrastructure/drizzle";
import { OAuthAccountRepository } from "../../interface-adapter/repositories/oauth-account";
import { AuthGuardSchema, authGuard } from "../../modules/auth-guard";
import { ElysiaWithEnv, NoContentResponse, NoContentResponseSchema } from "../../modules/elysia-with-env";
import { BadRequestException, ErrorResponseSchema, InternalServerErrorResponseSchema } from "../../modules/error";
import { pathDetail } from "../../modules/open-api";

export const UnlinkAccountConnection = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(authGuard())

	// Route
	.delete(
		"connections/:provider",
		async ({ cfModuleEnv: { DB }, params: { provider: _provider }, user }) => {
			// === Instances ===
			const provider = newOAuthProvider(_provider);

			const drizzleService = new DrizzleService(DB);

			const oauthAccountRepository = new OAuthAccountRepository(drizzleService);

			const unlinkAccountConnectionUseCase = new UnlinkAccountConnectionUseCase(oauthAccountRepository);
			// === End of instances ===

			const result = await unlinkAccountConnectionUseCase.execute(provider, user.id);

			if (isErr(result)) {
				throw new BadRequestException({
					code: result.code,
				});
			}

			return NoContentResponse();
		},
		{
			headers: AuthGuardSchema.headers,
			params: t.Object({
				provider: oauthProviderSchema,
			}),
			response: {
				204: NoContentResponseSchema,
				400: FlattenUnion(
					AuthGuardSchema.response[400],
					ErrorResponseSchema("ACCOUNT_NOT_LINKED"),
					ErrorResponseSchema("FAILED_TO_UNLINK_ACCOUNT"),
				),
				401: AuthGuardSchema.response[401],
				500: InternalServerErrorResponseSchema,
			},
			detail: pathDetail({
				operationId: "me-unlink-account-connection",
				summary: "Unlink Account Connection",
				description: "Unlink Account Connection endpoint for the User",
				tag: "Me",
			}),
		},
	);
