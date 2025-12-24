import { SESSION_COOKIE_NAME } from "@mona-ca/core/http";
import { Elysia, t } from "elysia";
import { match } from "ts-pattern";
import { isMobilePlatform } from "../../../../core/domain/value-objects";
import { defaultCookieOptions, noContent } from "../../../../core/infra/elysia";
import { toAnyTokenResponse } from "../../../../features/auth";
import { authPlugin } from "../../../../plugins/auth";
import { containerPlugin } from "../../../../plugins/container";
import { pathDetail } from "../../../../plugins/openapi";

export const IdentitiesUpdatePasswordRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(authPlugin())

	// Route
	.post(
		"/password",
		async ({ cookie, body: { currentPassword, newPassword }, userCredentials, clientPlatform, containers, status }) => {
			const result = await containers.auth.updatePasswordUseCase.execute(userCredentials, currentPassword, newPassword);

			if (result.isErr) {
				return match(result)
					.with({ code: "INVALID_CURRENT_PASSWORD" }, () =>
						status("Bad Request", {
							code: "INVALID_CURRENT_PASSWORD",
							message: "Current password is incorrect. Please check your password and try again.",
						}),
					)
					.exhaustive();
			}

			const { session, sessionToken } = result.value;

			if (isMobilePlatform(clientPlatform)) {
				return {
					sessionToken: toAnyTokenResponse(sessionToken),
				};
			}

			cookie[SESSION_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: toAnyTokenResponse(sessionToken),
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
