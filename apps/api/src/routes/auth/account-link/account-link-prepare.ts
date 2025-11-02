import { Elysia } from "elysia";
import { toAnySessionTokenResponse } from "../../../features/auth";
import { authPlugin } from "../../../plugins/auth";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";

export const AccountLinkPrepare = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(authPlugin())

	// Route
	.post(
		"/account-link/prepare",
		async ({ userIdentity, containers }) => {
			const result = await containers.auth.accountLinkPrepareUseCase.execute(userIdentity.id);

			const { accountLinkSessionToken } = result.value;
			return {
				accountLinkSessionToken: toAnySessionTokenResponse(accountLinkSessionToken),
			};
		},
		{
			detail: pathDetail({
				operationId: "auth-account-link-prepare",
				summary: "Account Link Prepare",
				description: "Account Link Prepare endpoint for the User",
				tag: "Auth - Account Link",
			}),
		},
	);
