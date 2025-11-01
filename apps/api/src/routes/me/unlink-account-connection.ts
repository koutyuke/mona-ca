import { Elysia, t } from "elysia";
import {
	externalIdentityProviderSchema,
	newExternalIdentityProvider,
} from "../../features/auth/domain/value-objects/external-identity";
import { authPlugin } from "../../plugins/auth";
import { containerPlugin } from "../../plugins/container";
import { pathDetail } from "../../plugins/openapi";

export const UnlinkAccountConnection = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(authPlugin())

	// Route
	.delete(
		"connections/:provider",
		async ({ params: { provider: _provider }, userIdentity, containers, status }) => {
			const provider = newExternalIdentityProvider(_provider);
			const result = await containers.auth.unlinkAccountConnectionUseCase.execute(provider, userIdentity);

			if (result.isErr) {
				const { code } = result;

				if (code === "PROVIDER_NOT_LINKED") {
					return status("Bad Request", {
						code: "PROVIDER_NOT_LINKED",
						message: "Account is not linked to this provider. Please check your account connections.",
					});
				}

				if (code === "PASSWORD_NOT_SET") {
					return status("Bad Request", {
						code: "PASSWORD_NOT_SET",
						message: "Cannot unlink account without a password set. Please set a password first.",
					});
				}
			}

			return status("No Content");
		},
		{
			params: t.Object({
				provider: externalIdentityProviderSchema,
			}),
			detail: pathDetail({
				operationId: "me-unlink-account-connection",
				summary: "Unlink Account Connection",
				description: "Unlink Account Connection endpoint for the User",
				tag: "Me",
			}),
		},
	);
