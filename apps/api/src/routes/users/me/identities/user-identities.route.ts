import { Elysia } from "elysia";
import { toUserIdentitiesResponse } from "../../../../features/auth";
import { authPlugin } from "../../../../plugins/auth";
import { containerPlugin } from "../../../../plugins/container";
import { pathDetail } from "../../../../plugins/openapi";

export const UserIdentitiesRoute = new Elysia()
	.use(containerPlugin())
	.use(
		authPlugin({
			withEmailVerification: false,
		}),
	)

	// Route
	.get(
		"",
		async ({ userCredentials, containers }) => {
			const result = await containers.auth.userIdentitiesUseCase.execute(userCredentials);

			const userIdentities = result.value;

			return toUserIdentitiesResponse(userIdentities);
		},
		{
			detail: pathDetail({
				operationId: "me-get-identities",
				summary: "Get User Identities",
				description: "Get User Identities endpoint for the User",
				tag: "Me",
				withAuth: true,
			}),
		},
	);
