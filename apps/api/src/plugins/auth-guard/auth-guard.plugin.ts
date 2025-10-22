import { Value } from "@sinclair/typebox/value";
import Elysia, { t } from "elysia";
import { type ClientType, clientTypeSchema, newClientType } from "../../core/domain/value-objects";
import { BadRequestException, ErrorResponseSchema, UnauthorizedException } from "../../core/infra/elysia";
import { CLIENT_TYPE_HEADER_NAME, SESSION_COOKIE_NAME, readBearerToken } from "../../core/lib/http";
import type { Session } from "../../features/auth/domain/entities/session";
import type { UserIdentity } from "../../features/auth/domain/entities/user-identity";
import { newSessionToken } from "../../features/auth/domain/value-objects/session-token";
import { di } from "../di";

type Response = {
	userIdentity: UserIdentity;
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

	const plugin = new Elysia({
		name: "@mona-ca/auth",
		seed: {
			requireEmailVerification,
			enableSessionCookieRefresh,
		},
	})
		.use(di())
		.derive<Response, "scoped">(
			{ as: "scoped" },
			async ({ cookie, headers: { authorization, [CLIENT_TYPE_HEADER_NAME]: clientType }, containers }) => {
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

				const result = await containers.auth.validateSessionUseCase.execute(newSessionToken(sessionToken));

				if (result.isErr) {
					const { code } = result;

					throw new UnauthorizedException({
						name: code,
					});
				}

				const { userIdentity, session } = result.value;

				if (requireEmailVerification && !userIdentity.emailVerified) {
					throw new UnauthorizedException({
						code: "EMAIL_VERIFICATION_REQUIRED",
						message: "Email verification is required.",
					});
				}

				if (enableSessionCookieRefresh && cookie[SESSION_COOKIE_NAME]) {
					cookie[SESSION_COOKIE_NAME].expires = session.expiresAt;
				}

				return { userIdentity, session, clientType: newClientType(clientType) };
			},
		);

	return plugin;
};

export const AuthGuardSchema = {
	headers: t.Object(
		{
			[CLIENT_TYPE_HEADER_NAME]: clientTypeSchema,
			authorization: t.Optional(t.String()),
		},
		{
			additionalProperties: true,
		},
	),
	response: {
		400: ErrorResponseSchema("INVALID_CLIENT_TYPE"),
		401: t.Union([
			ErrorResponseSchema("EXPIRED_SESSION"),
			ErrorResponseSchema("INVALID_SESSION"),
			ErrorResponseSchema("EMAIL_VERIFICATION_REQUIRED"),
		]),
	},
};
