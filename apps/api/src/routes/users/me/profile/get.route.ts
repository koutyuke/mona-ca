import { Elysia } from "elysia";
import { match } from "ts-pattern";
import { toUserProfileResponse } from "../../../../features/user";
import { authPlugin, unauthorizedResponse } from "../../../../plugins/auth";
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
		async ({ userCredentials, containers }) => {
			const getUserProfileResult = await containers.user.getUserProfileUseCase.execute(userCredentials.id);

			if (getUserProfileResult.isErr) {
				return match(getUserProfileResult)
					.with({ code: "USER_NOT_FOUND" }, () => unauthorizedResponse)
					.exhaustive();
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
