import { t } from "elysia";
import { UnlinkAccountConnectionUseCase } from "../../features/auth";
import { ExternalIdentityRepository } from "../../features/auth/adapters/repositories/external-identity/external-identity.repository";
import {
	externalIdentityProviderSchema,
	newExternalIdentityProvider,
} from "../../features/auth/domain/value-objects/external-identity";
import { AuthGuardSchema, authGuard } from "../../plugins/auth-guard";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../plugins/elysia-with-env";
import { BadRequestException } from "../../plugins/error";
import { pathDetail } from "../../plugins/open-api";
import { DrizzleService } from "../../shared/infra/drizzle";

export const UnlinkAccountConnection = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(authGuard())

	// Route
	.delete(
		"connections/:provider",
		async ({ cfModuleEnv: { DB }, params: { provider: _provider }, userIdentity }) => {
			// === Instances ===
			const provider = newExternalIdentityProvider(_provider);

			const drizzleService = new DrizzleService(DB);

			const externalIdentityRepository = new ExternalIdentityRepository(drizzleService);

			const unlinkAccountConnectionUseCase = new UnlinkAccountConnectionUseCase(externalIdentityRepository);
			// === End of instances ===

			const result = await unlinkAccountConnectionUseCase.execute(provider, userIdentity);

			if (result.isErr) {
				const { code } = result;

				if (code === "PROVIDER_NOT_LINKED") {
					throw new BadRequestException({
						code: "PROVIDER_NOT_LINKED",
						message: "Account is not linked to this provider. Please check your account connections.",
					});
				}

				if (code === "PASSWORD_NOT_SET") {
					throw new BadRequestException({
						code: "PASSWORD_NOT_SET",
						message: "Cannot unlink account without a password set. Please set a password first.",
					});
				}
			}

			return NoContentResponse();
		},
		{
			headers: AuthGuardSchema.headers,
			params: t.Object({
				provider: externalIdentityProviderSchema,
			}),
			response: withBaseResponseSchema({
				204: NoContentResponseSchema,
				400: ResponseTUnion(
					AuthGuardSchema.response[400],
					ErrorResponseSchema("PROVIDER_NOT_LINKED"),
					ErrorResponseSchema("UNLINK_OPERATION_FAILED"),
				),
				401: AuthGuardSchema.response[401],
			}),
			detail: pathDetail({
				operationId: "me-unlink-account-connection",
				summary: "Unlink Account Connection",
				description: "Unlink Account Connection endpoint for the User",
				tag: "Me",
			}),
		},
	);
