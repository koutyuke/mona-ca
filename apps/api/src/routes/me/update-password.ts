import { Elysia, t } from "elysia";
import { AuthGuardSchema, authGuard } from "../../plugins/auth-guard";
import { di } from "../../plugins/di";
import { pathDetail } from "../../plugins/open-api";
import { env } from "../../shared/infra/config/env";
import {
	BadRequestException,
	CookieManager,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../shared/infra/elysia";
import { SESSION_COOKIE_NAME } from "../../shared/lib/http";

export const UpdatePassword = new Elysia()
	// Local Middleware & Plugin
	.use(di())
	.use(authGuard())

	// Route
	.patch(
		"/password",
		async ({ cookie, body: { currentPassword, newPassword }, userIdentity, clientType, containers }) => {
			const cookieManager = new CookieManager(env.APP_ENV === "production", cookie);

			const result = await containers.auth.updatePasswordUseCase.execute(
				userIdentity,
				currentPassword ?? null,
				newPassword,
			);

			if (result.isErr) {
				const { code } = result;

				if (code === "INVALID_CURRENT_PASSWORD") {
					throw new BadRequestException({
						code: "INVALID_CURRENT_PASSWORD",
						message: "Current password is incorrect. Please check your password and try again.",
					});
				}
				throw new BadRequestException({
					code: code,
					message: "Failed to update password. Please try again.",
				});
			}

			const { session, sessionToken } = result.value;

			if (clientType === "mobile") {
				return {
					sessionToken,
				};
			}

			cookieManager.setCookie(SESSION_COOKIE_NAME, sessionToken, {
				expires: session.expiresAt,
			});

			return NoContentResponse();
		},
		{
			headers: AuthGuardSchema.headers,
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				currentPassword: t.Optional(t.String()),
				newPassword: t.String(),
			}),
			response: withBaseResponseSchema({
				200: t.Object({
					sessionToken: t.String(),
				}),
				204: NoContentResponseSchema,
				400: ResponseTUnion(AuthGuardSchema.response[400], ErrorResponseSchema("INVALID_CURRENT_PASSWORD")),
				401: AuthGuardSchema.response[401],
			}),
			detail: pathDetail({
				operationId: "me-update-password",
				summary: "Update Password",
				description: "Update Password endpoint for the User",
				tag: "Me",
				withAuth: true,
			}),
		},
	);
