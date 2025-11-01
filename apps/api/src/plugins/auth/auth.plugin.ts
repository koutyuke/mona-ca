import { Elysia, t } from "elysia";
import { SESSION_COOKIE_NAME, readBearerToken } from "../../core/lib/http";
import { newSessionToken } from "../../features/auth/domain/value-objects/session-token";
import { clientTypePlugin } from "../client-type";
import { containerPlugin } from "../container";

/**
 * Creates an authentication guard plugin for Elysia with environment configuration.
 *
 * @template T - A boolean indicating whether to include the session token in the derived context.
 * @param {AuthGuardOptions<T>} [options] - Optional configuration for the authentication guard.
 * @param {boolean} [options.requireEmailVerification=true] - Whether email verification is required for authentication.
 * @param {boolean} [options.enableSessionCookieRefresh=true] - Whether to enable session cookie refresh.
 * @returns The configured Elysia plugin with derived context.
 *
 * @example
 * const plugin = authGuard({ requireEmailVerification: false, includeSessionToken: true });
 */
export const authPlugin = (options?: {
	requireEmailVerification?: boolean;
	enableSessionCookieRefresh?: boolean;
}) => {
	const { requireEmailVerification = true, enableSessionCookieRefresh = true } = options ?? {};

	return new Elysia({
		name: "@mona-ca/auth",
		seed: {
			requireEmailVerification,
			enableSessionCookieRefresh,
		},
	})
		.use(containerPlugin())
		.use(clientTypePlugin())
		.guard({
			schema: "standalone",
			headers: t.Object({
				authorization: t.Optional(t.String()),
			}),
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
		})
		.resolve(
			async ({
				headers: { authorization },
				cookie: { [SESSION_COOKIE_NAME]: sessionCookie },
				clientType,
				containers,
				status,
			}) => {
				const sessionToken = clientType === "web" ? sessionCookie.value : readBearerToken(authorization ?? "");

				if (!sessionToken) {
					return status("Unauthorized", {
						code: "UNAUTHORIZED" as const,
						message: "It looks like you are not authenticated. Please login to continue.",
					});
				}

				const result = await containers.auth.validateSessionUseCase.execute(newSessionToken(sessionToken));

				if (result.isErr) {
					const { code } = result;
					return status("Unauthorized", {
						code,
						message: "It looks like your session is invalid. Please login to continue.",
					});
				}

				const { userIdentity, session } = result.value;

				if (requireEmailVerification && !userIdentity.emailVerified) {
					return status("Unauthorized", {
						code: "EMAIL_VERIFICATION_REQUIRED" as const,
						message: "It looks like your email is not verified. Please verify your email to continue.",
					});
				}

				if (enableSessionCookieRefresh && sessionCookie.value) {
					sessionCookie.expires = session.expiresAt;
				}

				return { userIdentity, session };
			},
		)
		.as("scoped");
};
