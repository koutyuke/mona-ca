import { Elysia } from "elysia";
import { ProfileResponseSchema, toProfileResponse } from "../../features/user";
import { AuthGuardSchema, authGuard } from "../../plugins/auth-guard";
import { di } from "../../plugins/di";
import { pathDetail } from "../../plugins/open-api";
import {
	BadRequestException,
	ErrorResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../shared/infra/elysia";

export const GetProfile = new Elysia()
	// Local Middleware & Plugin
	.use(di())
	.use(
		authGuard({
			requireEmailVerification: false,
		}),
	)

	// Route
	.get(
		"",
		async ({ userIdentity, containers }) => {
			const result = await containers.user.getProfileUseCase.execute(userIdentity.id);

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
