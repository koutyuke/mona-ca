import { Elysia, t } from "elysia";
import { defaultCookieOptions, noContent } from "../../core/infra/elysia";
import { SESSION_COOKIE_NAME } from "../../core/lib/http";
import { toAnySessionTokenResponse } from "../../features/auth";
import { authPlugin } from "../../plugins/auth";
import { containerPlugin } from "../../plugins/container";
import { pathDetail } from "../../plugins/openapi";

export const UpdatePassword = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(authPlugin())

	// Route
	.patch(
		"/password",
		async ({ cookie, body: { currentPassword, newPassword }, userIdentity, clientType, containers, status }) => {
			const result = await containers.auth.updatePasswordUseCase.execute(userIdentity, currentPassword, newPassword);

			if (result.isErr) {
				const { code } = result;

				if (code === "INVALID_CURRENT_PASSWORD") {
					return status("Bad Request", {
						code: "INVALID_CURRENT_PASSWORD",
						message: "Current password is incorrect. Please check your password and try again.",
					});
				}
				return status("Bad Request", {
					code: code,
					message: "Failed to update password. Please try again.",
				});
			}

			const { session, sessionToken } = result.value;

			if (clientType === "mobile") {
				return {
					sessionToken: toAnySessionTokenResponse(sessionToken),
				};
			}

			cookie[SESSION_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: sessionToken,
				expires: session.expiresAt,
			});

			return noContent();
		},
		{
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				currentPassword: t.Nullable(t.String()),
				newPassword: t.String(),
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
