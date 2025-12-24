import { Elysia, t } from "elysia";
import { genderSchema, newGender } from "../../../../core/domain/value-objects";
import { type UpdateUserProfileDto, toUserProfileResponse } from "../../../../features/user";
import { authPlugin } from "../../../../plugins/auth";
import { containerPlugin } from "../../../../plugins/container";
import { pathDetail } from "../../../../plugins/openapi";

export const ProfileUpdateRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(authPlugin())

	// Route
	.patch(
		"/",
		async ({ body: { name, gender, iconUrl }, userCredentials, containers, status }) => {
			const updateUserProfile: UpdateUserProfileDto = {};

			if (name) {
				updateUserProfile.name = name;
			}

			if (gender) {
				updateUserProfile.gender = newGender(gender);
			}

			if (iconUrl) {
				updateUserProfile.iconUrl = iconUrl;
			}

			const updatedUserProfileResult = await containers.user.updateUserProfileUseCase.execute(
				userCredentials.id,
				updateUserProfile,
			);

			if (updatedUserProfileResult.isErr) {
				return status("Bad Request", {
					code: updatedUserProfileResult.code,
					message: "Failed to update profile",
				});
			}

			const { userProfile } = updatedUserProfileResult.value;

			return toUserProfileResponse(userProfile);
		},
		{
			body: t.Object({
				name: t.Optional(
					t.String({
						minLength: 3,
						maxLength: 32,
					}),
				),
				gender: t.Optional(genderSchema),
				iconUrl: t.Optional(t.String()),
			}),
			detail: pathDetail({
				operationId: "me-update-profile",
				summary: "Update Profile",
				description: "Update Profile endpoint for the User",
				tag: "Me",
				withAuth: true,
			}),
		},
	);
