import { t } from "elysia";
import { UnlinkAccountConnectionUseCase } from "../../application/use-cases/account-link";
import { isErr } from "../../common/utils";
import { newOAuthProvider, oauthProviderSchema } from "../../domain/value-object";
import { DrizzleService } from "../../infrastructure/drizzle";
import { OAuthAccountRepository } from "../../interface-adapter/repositories/oauth-account";
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
			const provider = newOAuthProvider(_provider);

			const drizzleService = new DrizzleService(DB);

			const oauthAccountRepository = new OAuthAccountRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const unlinkAccountConnectionUseCase = new UnlinkAccountConnectionUseCase(oauthAccountRepository, userRepository);
			// === End of instances ===

			const result = await unlinkAccountConnectionUseCase.execute(provider, user.id);

			if (isErr(result)) {
				const { code } = result;

				switch (code) {
					case "ACCOUNT_NOT_LINKED":
						throw new BadRequestException({
							code: "ACCOUNT_NOT_LINKED",
							message: "Account is not linked to this provider. Please check your account connections.",
						});
					case "UNLINK_OPERATION_FAILED":
						throw new BadRequestException({
							code: "UNLINK_OPERATION_FAILED",
							message: "Failed to unlink account connection. Please try again.",
						});
					case "PASSWORD_NOT_SET":
						throw new BadRequestException({
							code: "PASSWORD_NOT_SET",
							message: "Cannot unlink account without a password set. Please set a password first.",
						});
					default:
						throw new BadRequestException({
							code: code,
							message: "Failed to unlink account connection. Please try again.",
						});
				}
			}

			return NoContentResponse();
		},
		{
			headers: AuthGuardSchema.headers,
			params: t.Object({
				provider: oauthProviderSchema,
			}),
			response: withBaseResponseSchema({
				204: NoContentResponseSchema,
				400: ResponseTUnion(
					AuthGuardSchema.response[400],
					ErrorResponseSchema("ACCOUNT_NOT_LINKED"),
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
