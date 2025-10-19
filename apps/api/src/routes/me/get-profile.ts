import { ProfileResponseSchema, toProfileResponse } from "../../features/user/adapters/presenters/profile.presenter";
import { ProfileRepository } from "../../features/user/adapters/repositories/profile/profile.repository";
import { GetProfileUseCase } from "../../features/user/application/use-cases/profile/get-profile.usecase";
import { AuthGuardSchema, authGuard } from "../../plugins/auth-guard";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../plugins/elysia-with-env";
import { BadRequestException } from "../../plugins/error";
import { pathDetail } from "../../plugins/open-api";
import { DrizzleService } from "../../shared/infra/drizzle";

export const GetProfile = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(
		authGuard({
			requireEmailVerification: false,
		}),
	)

	// Route
	.get(
		"",
		async ({ cfModuleEnv: { DB }, userIdentity }) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);

			const profileRepository = new ProfileRepository(drizzleService);

			const getProfileUseCase = new GetProfileUseCase(profileRepository);
			// === End of instances ===

			const result = await getProfileUseCase.execute(userIdentity.id);

			if (result.isErr) {
				throw new BadRequestException({
					code: result.code,
					message: "Failed to get profile",
				});
			}
			return toProfileResponse(result.value.profile);
		},
		{
			headers: AuthGuardSchema.headers,
			response: withBaseResponseSchema({
				200: ProfileResponseSchema,
				400: ResponseTUnion(AuthGuardSchema.response[400], ErrorResponseSchema("PROFILE_NOT_FOUND")),
				401: AuthGuardSchema.response[401],
			}),
			detail: pathDetail({
				operationId: "me-get-profile",
				summary: "Get Profile",
				description: "Get Profile endpoint for the User",
				tag: "Me",
				withAuth: true,
			}),
		},
	);
