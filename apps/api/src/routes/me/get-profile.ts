import { UserResponseSchema, toUserResponse } from "../../features/auth/adapters/presenters";
import { AuthGuardSchema, authGuard } from "../../plugins/auth-guard";
import { ElysiaWithEnv, withBaseResponseSchema } from "../../plugins/elysia-with-env";
import { pathDetail } from "../../plugins/open-api";

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
			return toUserResponse(user);
		},
		{
			headers: AuthGuardSchema.headers,
			response: withBaseResponseSchema({
				200: UserResponseSchema,
				400: AuthGuardSchema.response[400],
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
