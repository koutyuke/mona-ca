import { SessionTokenService } from "../../application/services/session-token";
import { ValidateSessionUseCase } from "../../application/use-cases/auth";
import { SESSION_COOKIE_NAME } from "../../common/constants";
import { readBearerToken } from "../../common/utils";
import { isErr } from "../../common/utils";
import type { Session, User } from "../../domain/entities";
import { DrizzleService } from "../../infrastructure/drizzle";
import { SessionRepository } from "../../interface-adapter/repositories/session";
import { UserRepository } from "../../interface-adapter/repositories/user";
import { ElysiaWithEnv } from "../elysia-with-env";
import { ErrorResponseSchema, UnauthorizedException } from "../error";

/**
 * Creates an authentication guard plugin for Elysia with environment configuration.
 *
 * @template T - A boolean indicating whether to include the session token in the derived context.
 * @param {AuthGuardOptions<T>} [options] - Optional configuration for the authentication guard.
 * @param {boolean} [options.requireEmailVerification=true] - Whether email verification is required for authentication.
 * @param {boolean} [options.enableSessionCookieRefresh=true] - Whether to enable session cookie refresh.
 * @param {boolean} [options.includeSessionToken=false] - Whether to include the session token in the derived context.
 * @returns The configured Elysia plugin with derived context.
 *
 * @example
 * const plugin = authGuard({ requireEmailVerification: false, includeSessionToken: true });
 */
export const authGuard = <
	T extends boolean,
	U extends Record<string, unknown> = T extends true
		? {
				user: User;
				session: Session;
				sessionToken: string;
			}
		: {
				user: User;
				session: Session;
			},
>(options?: {
	requireEmailVerification?: boolean;
	enableSessionCookieRefresh?: boolean;
	includeSessionToken?: T;
}) => {
	const {
		requireEmailVerification = true,
		enableSessionCookieRefresh = true,
		includeSessionToken = false,
	} = options ?? {};

	const plugin = new ElysiaWithEnv({
		name: "@mona-ca/auth",
		seed: {
			requireEmailVerification,
			enableSessionCookieRefresh,
			includeSessionToken,
		},
	}).derive<U, "scoped">(
		{ as: "scoped" },
		async ({ env: { SESSION_PEPPER }, cfModuleEnv: { DB }, cookie, headers: { authorization } }): Promise<U> => {
			const drizzleService = new DrizzleService(DB);
			const sessionTokenService = new SessionTokenService(SESSION_PEPPER);
			const sessionRepository = new SessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const validateSessionUseCase = new ValidateSessionUseCase(sessionTokenService, sessionRepository, userRepository);

			const sessionToken = cookie[SESSION_COOKIE_NAME]?.value || readBearerToken(authorization ?? "");

			if (!sessionToken) {
				throw new UnauthorizedException();
			}

			const result = await validateSessionUseCase.execute(sessionToken);

			if (isErr(result)) {
				const { code } = result;

				throw new UnauthorizedException({
					name: code,
				});
			}

			const { user, session } = result;

			if (requireEmailVerification && !user.emailVerified) {
				throw new UnauthorizedException({
					name: "EMAIL_VERIFICATION_IS_REQUIRED",
					message: "Email verification is required.",
				});
			}

			if (enableSessionCookieRefresh && cookie[SESSION_COOKIE_NAME]) {
				cookie[SESSION_COOKIE_NAME].expires = session.expiresAt;
			}

			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			return (includeSessionToken ? { user, session, sessionToken } : { user, session }) as any;
		},
	);

	return plugin;
};

export const AuthGuardSchema = {
	response: {
		401: [
			ErrorResponseSchema("SESSION_EXPIRED"),
			ErrorResponseSchema("SESSION_OR_USER_NOT_FOUND"),
			ErrorResponseSchema("EMAIL_VERIFICATION_IS_REQUIRED"),
		],
	},
};
