import { AUTHORIZATION_HEADER_NAME, SESSION_COOKIE_NAME, readBearerToken } from "@mona-ca/core/http";
import { Elysia, status, t } from "elysia";
import { match } from "ts-pattern";
import { isMobilePlatform, isWebPlatform } from "../../core/domain/value-objects";
import type { Session } from "../../features/auth/domain/entities/session";
import type { UserCredentials } from "../../features/auth/domain/entities/user-credentials";
import { newSessionToken } from "../../features/auth/domain/value-objects/tokens";
import { clientPlatformPlugin } from "../client-platform";
import { containerPlugin } from "../container";

export const unauthorizedResponse = status("Unauthorized", {
	code: "UNAUTHORIZED",
	message: "It looks like you are not authenticated. Please login again.",
});

const requiredEmailVerificationResponse = status("Forbidden", {
	code: "REQUIRED_EMAIL_VERIFICATION",
	message: "It looks like your email is not verified. Please verify your email to continue.",
});

type AuthError<WithEmailVerification extends boolean> =
	| typeof unauthorizedResponse
	| (WithEmailVerification extends true ? typeof requiredEmailVerificationResponse : never);

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
export const authPlugin = <WithEmailVerification extends boolean = true>(options?: {
	withEmailVerification?: WithEmailVerification;
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
				[AUTHORIZATION_HEADER_NAME]: t.Optional(t.TemplateLiteral("Bearer ${string}")),
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
			}): Promise<{ userCredentials: UserCredentials; session: Session } | AuthError<WithEmailVerification>> => {
				const rawSessionToken: string | null | undefined = match(clientPlatform)
					.when(isWebPlatform, () => sessionCookie?.value)
					.when(isMobilePlatform, () => {
						return readBearerToken(authorizationHeader ?? "");
					})
					.exhaustive();

				if (!rawSessionToken) {
					return unauthorizedResponse;
				}

				const sessionToken = newSessionToken(rawSessionToken);

				const validationResult = await containers.auth.validateSessionUseCase.execute(sessionToken);

				if (validationResult.isErr) {
					return match(validationResult)
						.with({ code: "INVALID_SESSION" }, () => unauthorizedResponse)
						.exhaustive();
				}

				const { userCredentials, session } = validationResult.value;

				if (isWebPlatform(clientPlatform)) {
					sessionCookie.expires = session.expiresAt;
				}

				if (withEmailVerification && !userCredentials.emailVerified) {
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					return requiredEmailVerificationResponse as any;
				}

				return { userCredentials, session };
			},
		)
		.as("scoped");
};
