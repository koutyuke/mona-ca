import { Elysia, t } from "elysia";
import { genderSchema, newGender } from "../../core/domain/value-objects";
import { type UpdateProfileDto, toProfileResponse } from "../../features/user";
import { authPlugin } from "../../plugins/auth";
import { containerPlugin } from "../../plugins/container";
import { pathDetail } from "../../plugins/openapi";

export const UpdateProfile = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(authPlugin())

	// Route
	.patch(
		"",
		async ({ body: { name, gender, iconUrl }, userIdentity, containers, status }) => {
			const updateProfile: UpdateProfileDto = {};

			if (name) {
				updateProfile.name = name;
			}

			if (gender) {
				updateProfile.gender = newGender(gender);
			}

			if (iconUrl) {
				updateProfile.iconUrl = iconUrl;
			}

			const updatedProfile = await containers.user.updateProfileUseCase.execute(userIdentity.id, updateProfile);

			if (updatedProfile.isErr) {
				return status("Bad Request", {
					code: updatedProfile.code,
					message: "Failed to update profile",
				});
			}

			return toProfileResponse(updatedProfile.value.profile);
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
