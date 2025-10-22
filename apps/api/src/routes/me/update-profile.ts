import { Elysia, t } from "elysia";
import { ProfileResponseSchema, type UpdateProfileDto, toProfileResponse } from "../../features/user";
import { AuthGuardSchema, authGuard } from "../../plugins/auth-guard";
import { di } from "../../plugins/di";
import { pathDetail } from "../../plugins/open-api";
import { genderSchema, newGender } from "../../shared/domain/value-objects";
import {
	BadRequestException,
	ErrorResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../shared/infra/elysia";

export const UpdateProfile = new Elysia()
	// Local Middleware & Plugin
	.use(di())
	.use(authGuard())

	// Route
	.patch(
		"",
		async ({ body: { name, gender, iconUrl }, userIdentity, containers }) => {
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
				throw new BadRequestException({
					code: updatedProfile.code,
					message: "Failed to update profile",
				});
			}

			return toProfileResponse(updatedProfile.value.profile);
		},
		{
			headers: AuthGuardSchema.headers,
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
			response: withBaseResponseSchema({
				200: ProfileResponseSchema,
				400: ResponseTUnion(AuthGuardSchema.response[400], ErrorResponseSchema("PROFILE_NOT_FOUND")),
				401: AuthGuardSchema.response[401],
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
