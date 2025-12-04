import { Elysia, t } from "elysia";
import { match } from "ts-pattern";
import { isMobilePlatform, isWebPlatform } from "../../core/domain/value-objects/client-platform";
import { SESSION_COOKIE_NAME, readBearerToken } from "../../core/lib/http";
import { AUTHORIZATION_HEADER_NAME } from "../../core/lib/http/constants";
import { newSessionToken } from "../../features/auth/domain/value-objects/tokens";
import { clientPlatformPlugin } from "../client-platform";
import { containerPlugin } from "../container";

/**
 * Creates an authentication guard plugin for Elysia with environment configuration.
 *
 * @template T - A boolean indicating whether to include the session token in the derived context.
 * @param {AuthGuardOptions<T>} [options] - Optional configuration for the authentication guard.
 * @param {boolean} [options.requireEmailVerification=true] - Whether email verification is required for authentication.
 * @returns The configured Elysia plugin with derived context.
 *
 * @example
 * const plugin = authPlugin({ requireEmailVerification: false });
 */
export const authPlugin = (options?: {
	withEmailVerification?: boolean;
}) => {
	const { withEmailVerification = true } = options ?? {};

	return new Elysia({
		name: "@mona-ca/auth",
		seed: {
			withEmailVerification,
		},
	})
		.use(containerPlugin())
		.use(clientPlatformPlugin())
		.guard({
			schema: "standalone",
			headers: t.Object({
				[AUTHORIZATION_HEADER_NAME]: t.Optional(t.String()),
			}),
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
		})
		.resolve(
			async ({
				headers: { [AUTHORIZATION_HEADER_NAME]: authorizationHeader },
				cookie: { [SESSION_COOKIE_NAME]: sessionCookie },
				clientPlatform,
				containers,
				status,
			}) => {
				const rawSessionToken: string | null | undefined = match(clientPlatform)
					.when(isWebPlatform, () => sessionCookie?.value)
					.when(isMobilePlatform, () => {
						return readBearerToken(authorizationHeader ?? "");
					})
					.otherwise(() => null);

				if (!rawSessionToken) {
					return status("Unauthorized", {
						code: "UNAUTHORIZED" as const,
						message: "It looks like you are not authenticated. Please login to continue.",
					});
				}

				const sessionToken = newSessionToken(rawSessionToken);

				const validationResult = await containers.auth.validateSessionUseCase.execute(sessionToken);

				if (validationResult.isErr) {
					return match(validationResult)
						.with({ code: "SESSION_EXPIRED" }, () =>
							status("Unauthorized", {
								code: "SESSION_EXPIRED" as const,
								message: "It looks like your session is expired. Please login to continue.",
							}),
						)
						.with({ code: "SESSION_INVALID" }, () =>
							status("Unauthorized", {
								code: "SESSION_INVALID" as const,
								message: "It looks like your session is invalid. Please login to continue.",
							}),
						)
						.exhaustive();
				}

				const { userCredentials, session } = validationResult.value;

				if (isWebPlatform(clientPlatform)) {
					sessionCookie.expires = session.expiresAt;
				}

				if (withEmailVerification && !userCredentials.emailVerified) {
					return status("Unauthorized", {
						code: "EMAIL_VERIFICATION_REQUIRED" as const,
						message: "It looks like your email is not verified. Please verify your email to continue.",
					});
				}

				return { userCredentials, session };
			},
		)
		.as("scoped");
};
