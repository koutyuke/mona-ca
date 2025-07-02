import { Value } from "@sinclair/typebox/value";
import { t } from "elysia";
import { SessionTokenService } from "../../application/services/session-token";
import { ValidateSessionUseCase } from "../../application/use-cases/auth";
import { CLIENT_TYPE_HEADER_NAME, SESSION_COOKIE_NAME } from "../../common/constants";
import { readBearerToken } from "../../common/utils";
import { isErr } from "../../common/utils";
import type { Session, User } from "../../domain/entities";
import { type ClientType, clientTypeSchema } from "../../domain/value-object";
import { newClientType } from "../../domain/value-object/client-type";
import { DrizzleService } from "../../infrastructure/drizzle";
import { SessionRepository } from "../../interface-adapter/repositories/session";
import { UserRepository } from "../../interface-adapter/repositories/user";
import { ElysiaWithEnv } from "../elysia-with-env";
import { BadRequestException, ErrorResponseSchema, UnauthorizedException } from "../error";

type Response = {
	user: User;
	session: Session;
	clientType: ClientType;
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
export const authGuard = (options?: {
	requireEmailVerification?: boolean;
	enableSessionCookieRefresh?: boolean;
}) => {
	const { requireEmailVerification = true, enableSessionCookieRefresh = true } = options ?? {};

	const plugin = new ElysiaWithEnv({
		name: "@mona-ca/auth",
		seed: {
			requireEmailVerification,
			enableSessionCookieRefresh,
		},
	}).derive<Response, "scoped">(
		{ as: "scoped" },
		async ({
			env: { SESSION_PEPPER },
			cfModuleEnv: { DB },
			cookie,
			headers: { authorization, [CLIENT_TYPE_HEADER_NAME]: clientType },
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const sessionTokenService = new SessionTokenService(SESSION_PEPPER);
			const sessionRepository = new SessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const validateSessionUseCase = new ValidateSessionUseCase(sessionTokenService, sessionRepository, userRepository);
			// === End of instances ===

			if (!clientType || !Value.Check(clientTypeSchema, clientType)) {
				throw new BadRequestException({
					name: "INVALID_CLIENT_TYPE",
					message: "Invalid client type.",
				});
			}

			const sessionToken =
				clientType === "web" ? cookie[SESSION_COOKIE_NAME]?.value : readBearerToken(authorization ?? "");

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

			return { user, session, clientType: newClientType(clientType) };
		},
	);

	return plugin;
};

export const AuthGuardSchema = {
	headers: t.Object(
		{
			[CLIENT_TYPE_HEADER_NAME]: clientTypeSchema,
		},
		{
			additionalProperties: true,
		},
	),
	response: {
		400: ErrorResponseSchema("INVALID_CLIENT_TYPE"),
		401: t.Union([
			ErrorResponseSchema("EXPIRED_SESSION"),
			ErrorResponseSchema("SESSION_OR_USER_NOT_FOUND"),
			ErrorResponseSchema("INVALID_SESSION_TOKEN"),
			ErrorResponseSchema("EMAIL_VERIFICATION_IS_REQUIRED"),
		]),
	},
};
