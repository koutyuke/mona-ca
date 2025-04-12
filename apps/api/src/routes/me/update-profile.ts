import { t } from "elysia";
import { type UpdateUserProfileDto, UpdateUserProfileUseCase } from "../../application/use-cases/user";
import { genderSchema, newGender } from "../../domain/value-object";
import { DrizzleService } from "../../infrastructure/drizzle";
import { UserPresenterResultSchema, userPresenter } from "../../interface-adapter/presenter";
import { UserRepository } from "../../interface-adapter/repositories/user";
import { AuthGuardSchema, authGuard } from "../../modules/auth-guard";
import { ElysiaWithEnv } from "../../modules/elysia-with-env";
import { InternalServerErrorResponseSchema } from "../../modules/error";
import { pathDetail } from "../../modules/open-api";

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

			return userPresenter(updatedUser);
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
			response: {
				200: UserPresenterResultSchema,
				400: AuthGuardSchema.response[400],
				401: AuthGuardSchema.response[401],
				500: InternalServerErrorResponseSchema,
			},
			detail: pathDetail({
				operationId: "me-update-profile",
				summary: "Update Profile",
				description: "Update Profile endpoint for the User",
				tag: "Me",
				withAuth: true,
			}),
		},
	);
