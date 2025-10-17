import { t } from "elysia";
import type { UpdateUserProfileDto } from "../../application/ports/in";
import { genderSchema, newGender } from "../../common/domain/value-objects";
import { UserResponseSchema, toUserResponse } from "../../features/auth/adapters/presenters";
import { UserRepository } from "../../features/user/adapters/repositories/user";
import { UpdateUserProfileUseCase } from "../../features/user/application/use-cases/user";
import { DrizzleService } from "../../infrastructure/drizzle";
import { AuthGuardSchema, authGuard } from "../../plugins/auth-guard";
import { ElysiaWithEnv, withBaseResponseSchema } from "../../plugins/elysia-with-env";
import { pathDetail } from "../../plugins/open-api";

export const UpdateProfile = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(authGuard())

	// Route
	.patch(
		"",
		async ({ cfModuleEnv: { DB }, body: { name, gender, iconUrl }, user }) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);

			const userRepository = new UserRepository(drizzleService);

			const updateUserProfileUseCase = new UpdateUserProfileUseCase(userRepository);
			// === End of instances ===

			const updateProfile: UpdateUserProfileDto = {};

			if (name) {
				updateProfile.name = name;
			}

			if (gender) {
				updateProfile.gender = newGender(gender);
			}

			if (iconUrl) {
				updateProfile.iconUrl = iconUrl;
			}

			const updatedUser = await updateUserProfileUseCase.execute(user, updateProfile);

			return toUserResponse(updatedUser);
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
				200: UserResponseSchema,
				400: AuthGuardSchema.response[400],
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
