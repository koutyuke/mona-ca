import { Elysia, t } from "elysia";
import { match } from "ts-pattern";
import { genderSchema, newGender } from "../../../../core/domain/value-objects";
import { toUserProfileResponse } from "../../../../features/user";
import { authPlugin, unauthorizedResponse } from "../../../../plugins/auth";
import { containerPlugin } from "../../../../plugins/container";
import { pathDetail } from "../../../../plugins/openapi";

import type { UpdateUserProfileDto } from "../../../../features/user";

export const ProfileUpdateRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(authPlugin())

	// Route
	.patch(
		"",
		async ({ body: { name, gender, iconUrl }, userCredentials, containers }) => {
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
				return match(updatedUserProfileResult)
					.with({ code: "USER_NOT_FOUND" }, () => unauthorizedResponse)
					.exhaustive();
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
