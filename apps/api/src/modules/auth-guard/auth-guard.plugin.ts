import { ValidateSessionUseCase } from "@/application/use-cases/auth";
import { SESSION_COOKIE_NAME } from "@/common/constants";
import { readBearerToken } from "@/common/utils/read-bearer-token";
import { readSessionCookie } from "@/common/utils/read-session-cookie";
import type { Session } from "@/domain/session";
import type { User } from "@/domain/user";
import { DrizzleService } from "@/infrastructure/drizzle";
import { SessionRepository } from "@/interface-adapter/repositories/session";
import { UserRepository } from "@/interface-adapter/repositories/user";
import { SessionTokenService } from "@/services/session-token";
import { ElysiaWithEnv } from "../elysia-with-env";
import { UnauthorizedException } from "../error/exceptions";

type AuthGuardOptions<T extends boolean> = {
	requireEmailVerification?: boolean;
	enableSessionCookieRefresh?: boolean;
	includeSessionToken?: T;
};

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
const authGuard = <T extends boolean>(options?: AuthGuardOptions<T>) => {
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
	}).derive<
		T extends true
			? {
					user: User;
					session: Session;
					sessionToken: string;
				}
			: {
					user: User;
					session: Session;
				},
		"scoped"
	>(
		{ as: "scoped" },
		async ({
			env: { SESSION_PEPPER },
			cfModuleEnv: { DB },
			cookie,
			headers: { authorization },
		}): Promise<
			T extends true
				? {
						user: User;
						session: Session;
						sessionToken: string;
					}
				: {
						user: User;
						session: Session;
					}
		> => {
			const drizzleService = new DrizzleService(DB);
			const sessionTokenService = new SessionTokenService(SESSION_PEPPER);
			const sessionRepository = new SessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const validateSessionUseCase = new ValidateSessionUseCase(sessionTokenService, sessionRepository, userRepository);

			const sessionToken = readSessionCookie(cookie) || readBearerToken(authorization ?? "");

			if (!sessionToken) {
				throw new UnauthorizedException();
			}

			const { user, session } = await validateSessionUseCase.execute(sessionToken);

			if (!user || !session) {
				throw new UnauthorizedException();
			}

			if (requireEmailVerification && !user.emailVerified) {
				throw new UnauthorizedException({
					name: "EmailVerificationRequired",
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

export { authGuard };
