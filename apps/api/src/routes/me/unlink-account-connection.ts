import { Elysia, t } from "elysia";
import {
	externalIdentityProviderSchema,
	newExternalIdentityProvider,
} from "../../features/auth/domain/value-objects/external-identity";
import { AuthGuardSchema, authGuard } from "../../plugins/auth-guard";
import { di } from "../../plugins/di";
import { pathDetail } from "../../plugins/open-api";
import {
	BadRequestException,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../shared/infra/elysia";

export const UnlinkAccountConnection = new Elysia()
	// Local Middleware & Plugin
	.use(di())
	.use(authGuard())

	// Route
	.delete(
		"connections/:provider",
		async ({ params: { provider: _provider }, userIdentity, containers }) => {
			const provider = newExternalIdentityProvider(_provider);
			const result = await containers.auth.unlinkAccountConnectionUseCase.execute(provider, userIdentity);

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
