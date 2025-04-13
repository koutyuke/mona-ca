import { UserPresenter, UserPresenterResultSchema } from "../../interface-adapter/presenter";
import { AuthGuardSchema, authGuard } from "../../modules/auth-guard";
import { ElysiaWithEnv } from "../../modules/elysia-with-env";
import { InternalServerErrorResponseSchema } from "../../modules/error";
import { pathDetail } from "../../modules/open-api";

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
		({ user }) => {
			return UserPresenter(user);
		},
		{
			headers: AuthGuardSchema.headers,
			response: {
				200: UserPresenterResultSchema,
				400: AuthGuardSchema.response[400],
				401: AuthGuardSchema.response[401],
				500: InternalServerErrorResponseSchema,
			},
			detail: pathDetail({
				operationId: "me-get-profile",
				summary: "Get Profile",
				description: "Get Profile endpoint for the User",
				tag: "Me",
				withAuth: true,
			}),
		},
	);
