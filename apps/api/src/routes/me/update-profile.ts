import { t } from "elysia";
import { UpdateProfileUseCase } from "../../features/user";
import { ProfileResponseSchema, toProfileResponse } from "../../features/user/adapters/presenters/profile.presenter";
import { ProfileRepository } from "../../features/user/adapters/repositories/profile/profile.repository";
import type { UpdateProfileDto } from "../../features/user/application/contracts/profile/update-profile.usecase.interface";
import { AuthGuardSchema, authGuard } from "../../plugins/auth-guard";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../plugins/elysia-with-env";
import { BadRequestException } from "../../plugins/error";
import { pathDetail } from "../../plugins/open-api";
import { genderSchema, newGender } from "../../shared/domain/value-objects";
import { DrizzleService } from "../../shared/infra/drizzle";

export const UpdateProfile = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(authGuard())

	// Route
	.patch(
		"",
		async ({ cfModuleEnv: { DB }, body: { name, gender, iconUrl }, userIdentity }) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);

			const profileRepository = new ProfileRepository(drizzleService);

			const updateProfileUseCase = new UpdateProfileUseCase(profileRepository);
			// === End of instances ===

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

			const updatedProfile = await updateProfileUseCase.execute(userIdentity.id, updateProfile);

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
