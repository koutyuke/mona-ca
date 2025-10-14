import { t } from "elysia";
import { UnlinkAccountConnectionUseCase } from "../../application/use-cases/account-link";
import { externalIdentityProviderSchema, newExternalIdentityProvider } from "../../domain/value-objects";
import { DrizzleService } from "../../infrastructure/drizzle";
import { ExternalIdentityRepository } from "../../interface-adapter/repositories/external-identity";
import { UserRepository } from "../../interface-adapter/repositories/user";
import { AuthGuardSchema, authGuard } from "../../modules/auth-guard";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../modules/elysia-with-env";
import { BadRequestException } from "../../modules/error";
import { pathDetail } from "../../modules/open-api";

export const UnlinkAccountConnection = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(authGuard())

	// Route
	.delete(
		"connections/:provider",
		async ({ cfModuleEnv: { DB }, params: { provider: _provider }, user }) => {
			// === Instances ===
			const provider = newExternalIdentityProvider(_provider);

			const drizzleService = new DrizzleService(DB);

			const externalIdentityRepository = new ExternalIdentityRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const unlinkAccountConnectionUseCase = new UnlinkAccountConnectionUseCase(
				externalIdentityRepository,
				userRepository,
			);
			// === End of instances ===

			const result = await unlinkAccountConnectionUseCase.execute(provider, user.id);

			if (result.isErr) {
				const { code } = result;

				if (code === "PROVIDER_NOT_LINKED") {
					throw new BadRequestException({
						code: "PROVIDER_NOT_LINKED",
						message: "Account is not linked to this provider. Please check your account connections.",
					});
				}

				if (code === "UNLINK_OPERATION_FAILED") {
					throw new BadRequestException({
						code: "UNLINK_OPERATION_FAILED",
						message: "Failed to unlink account connection. Please try again.",
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
					ErrorResponseSchema("PASSWORD_NOT_SET"),
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
