import { Elysia, t } from "elysia";
import { identityProvidersSchema, newIdentityProviders, toAnyTokenResponse } from "../../../../../features/auth";
import { authPlugin } from "../../../../../plugins/auth";
import { containerPlugin } from "../../../../../plugins/container";
import { pathDetail } from "../../../../../plugins/openapi";

export const ProviderLinkPrepareRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(authPlugin())

	// Route
	.post(
		"/:provider/link/prepare",
		async ({ params: { provider: _provider }, userCredentials, containers }) => {
			const provider = newIdentityProviders(_provider);
			const result = await containers.auth.providerLinkPrepareUseCase.execute(userCredentials.id, provider);

			const { providerLinkRequestToken } = result.value;

			return {
				linkToken: toAnyTokenResponse(providerLinkRequestToken),
			};
		},
		{
			params: t.Object({
				provider: identityProvidersSchema,
			}),
			detail: pathDetail({
				operationId: "me-provider-link-prepare",
				summary: "Provider Link Prepare",
				description: "Provider Link Prepare endpoint for the User",
				tag: "Me - Provider Link",
				withAuth: true,
			}),
		},
	);
