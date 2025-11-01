import { Elysia } from "elysia";
import { toProfileResponse } from "../../features/user";
import { authPlugin } from "../../plugins/auth";
import { containerPlugin } from "../../plugins/container";
import { pathDetail } from "../../plugins/openapi";

export const GetProfile = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(
		authPlugin({
			requireEmailVerification: false,
		}),
	)

	// Route
	.get(
		"",
		async ({ userIdentity, containers, status }) => {
			const result = await containers.user.getProfileUseCase.execute(userIdentity.id);

			if (result.isErr) {
				return status("Bad Request", {
					code: result.code,
					message: "Failed to get profile",
				});
			}
			return toProfileResponse(result.value.profile);
		},
		{
			detail: pathDetail({
				operationId: "me-get-profile",
				summary: "Get Profile",
				description: "Get Profile endpoint for the User",
				tag: "Me",
				withAuth: true,
			}),
		},
	);
