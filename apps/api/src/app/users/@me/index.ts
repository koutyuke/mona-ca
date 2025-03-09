import { t } from "elysia";
import { type UpdateUserProfileDto, UpdateUserProfileUseCase } from "../../../application/use-cases/user";
import { genderSchema, newGender } from "../../../domain/value-object";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { UserPresenterResultSchema, userPresenter } from "../../../interface-adapter/presenter";
import { UserRepository } from "../../../interface-adapter/repositories/user";
import { authGuard } from "../../../modules/auth-guard";
import { ElysiaWithEnv } from "../../../modules/elysia-with-env";
import { Email } from "./email";

const Me = new ElysiaWithEnv({
	prefix: "/@me",
})
	// Other Routes
	.use(Email)

	// Local Middleware & Plugin
	.use(
		authGuard({
			requireEmailVerification: false,
		}),
	)

	// Route
	.get(
		"/",
		({ user }) => {
			return userPresenter(user);
		},
		{
			response: {
				200: UserPresenterResultSchema,
			},
		},
	)

	.patch(
		"/",
		async ({ cfModuleEnv: { DB }, body: { name, gender, iconUrl }, user }) => {
			const drizzleService = new DrizzleService(DB);

			const userRepository = new UserRepository(drizzleService);

			const updateUserProfileUseCase = new UpdateUserProfileUseCase(userRepository);

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
			},
		},
	);

export { Me };
