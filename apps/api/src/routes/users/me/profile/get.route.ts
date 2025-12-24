import { Elysia } from "elysia";
import { toUserProfileResponse } from "../../../../features/user";
import { authPlugin } from "../../../../plugins/auth";
import { containerPlugin } from "../../../../plugins/container";
import { pathDetail } from "../../../../plugins/openapi";

export const ProfileGetRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(
		authPlugin({
			withEmailVerification: false,
		}),
	)

	// Route
	.get(
		"",
		async ({ userCredentials, containers, status }) => {
			const getUserProfileResult = await containers.user.getUserProfileUseCase.execute(userCredentials.id);

			if (getUserProfileResult.isErr) {
				return status("Bad Request", {
					code: getUserProfileResult.code,
					message: "Failed to get profile",
				});
			}

			const { userProfile } = getUserProfileResult.value;

			return toUserProfileResponse(userProfile);
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
