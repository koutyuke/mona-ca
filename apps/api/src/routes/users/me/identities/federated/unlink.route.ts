import { Elysia, t } from "elysia";
import { noContent } from "../../../../../core/infra/elysia";
import { identityProvidersSchema, newIdentityProviders } from "../../../../../features/auth";
import { authPlugin } from "../../../../../plugins/auth";
import { containerPlugin } from "../../../../../plugins/container";
import { pathDetail } from "../../../../../plugins/openapi";

export const UnlinkFederatedIdentity = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(authPlugin())

	// Route
	.delete(
		"/:provider",
		async ({ params: { provider: _provider }, userCredentials, containers, status }) => {
			const provider = newIdentityProviders(_provider);
			const result = await containers.auth.providerLinkUnlinkUseCase.execute(provider, userCredentials);

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

				return status("Bad Request", {
					code: code,
					message: "Failed to unlink account connection. Please try again.",
				});
			}

			return noContent();
		},
		{
			params: t.Object({
				provider: identityProvidersSchema,
			}),
			detail: pathDetail({
				operationId: "me-unlink-federated-identity",
				summary: "Unlink Federated Identity",
				description: "Unlink Federated Identity endpoint for the User",
				tag: "Me - Provider Link",
			}),
		},
	);
