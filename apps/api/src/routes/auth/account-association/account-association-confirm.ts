import { Elysia, t } from "elysia";
import { newAccountAssociationSessionToken } from "../../../features/auth";
import { di } from "../../../plugins/di";
import { pathDetail } from "../../../plugins/open-api";
import { RateLimiterSchema, rateLimit } from "../../../plugins/rate-limit";
import { WithClientTypeSchema, withClientType } from "../../../plugins/with-client-type";
import { env } from "../../../shared/infra/config/env";
import {
	BadRequestException,
	CookieManager,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	UnauthorizedException,
	withBaseResponseSchema,
} from "../../../shared/infra/elysia";
import { ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from "../../../shared/lib/http";

export const AccountAssociationConfirm = new Elysia()
	// Local Middleware & Plugin
	.use(di())
	.use(withClientType)
	.use(
		rateLimit("account-association-confirm", {
			maxTokens: 1000,
			refillRate: 500,
			refillInterval: {
				value: 10,
				unit: "m",
			},
		}),
	)

	// Route
	.post(
		"/association/confirm",
		async ({
			cookie,
			body: { accountAssociationSessionToken: bodyAccountAssociationSessionToken, code },
			clientType,
			rateLimit,
			containers,
		}) => {
			const cookieManager = new CookieManager(env.APP_ENV === "production", cookie);

			const rawAccountAssociationSessionToken =
				clientType === "web"
					? cookieManager.getCookie(ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME)
					: bodyAccountAssociationSessionToken;

			if (!rawAccountAssociationSessionToken) {
				throw new UnauthorizedException({
					code: "ACCOUNT_ASSOCIATION_SESSION_INVALID",
					message: "Account association session not found. Please login again.",
				});
			}

			const validateResult = await containers.auth.validateAccountAssociationSessionUseCase.execute(
				newAccountAssociationSessionToken(rawAccountAssociationSessionToken),
			);

			if (validateResult.isErr) {
				const { code } = validateResult;

				if (code === "ACCOUNT_ASSOCIATION_SESSION_INVALID") {
					throw new UnauthorizedException({
						code: code,
						message: "Invalid account association session. Please login again.",
					});
				}
				if (code === "ACCOUNT_ASSOCIATION_SESSION_EXPIRED") {
					throw new UnauthorizedException({
						code: code,
						message: "Account association session has expired. Please login again.",
					});
				}
			}

			const { accountAssociationSession, userIdentity } = validateResult.value;

			await rateLimit.consume(userIdentity.id, 100);

			const confirmResult = await containers.auth.accountAssociationConfirmUseCase.execute(
				code,
				userIdentity,
				accountAssociationSession,
			);

			if (confirmResult.isErr) {
				const { code } = confirmResult;

				if (code === "INVALID_ASSOCIATION_CODE") {
					throw new BadRequestException({
						code,
						message: "Invalid association code. Please check your email and try again.",
					});
				}
				if (code === "ACCOUNT_ALREADY_LINKED") {
					throw new BadRequestException({
						code,
						message: "This OAuth provider is already linked to your account.",
					});
				}
				if (code === "ACCOUNT_LINKED_ELSEWHERE") {
					throw new BadRequestException({
						code,
						message: "This OAuth account is already linked to another user.",
					});
				}
			}

			const { sessionToken, session } = confirmResult.value;

			if (clientType === "mobile") {
				return {
					sessionToken,
				};
			}

			cookieManager.deleteCookie(ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME);
			cookieManager.setCookie(SESSION_COOKIE_NAME, sessionToken, {
				expires: session.expiresAt,
			});

			return NoContentResponse();
		},
		{
			beforeHandle: async ({ rateLimit, ip }) => {
				await rateLimit.consume(ip, 1);
			},
			headers: WithClientTypeSchema.headers,
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
				[ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				accountAssociationSessionToken: t.Optional(t.String()),
				code: t.String(),
			}),
			response: withBaseResponseSchema({
				200: t.Object({
					sessionToken: t.String(),
				}),
				204: NoContentResponseSchema,
				400: ResponseTUnion(
					WithClientTypeSchema.response[400],
					ErrorResponseSchema("INVALID_ASSOCIATION_CODE"),
					ErrorResponseSchema("ACCOUNT_ALREADY_LINKED"),
					ErrorResponseSchema("ACCOUNT_LINKED_ELSEWHERE"),
					ErrorResponseSchema("USER_NOT_FOUND"),
				),
				401: ResponseTUnion(
					ErrorResponseSchema("ACCOUNT_ASSOCIATION_SESSION_INVALID"),
					ErrorResponseSchema("ACCOUNT_ASSOCIATION_SESSION_EXPIRED"),
				),
				429: RateLimiterSchema.response[429],
			}),
			detail: pathDetail({
				tag: "Auth - Account Association",
				operationId: "auth-account-association-confirm",
				summary: "Account Association Confirm",
				description: "Account Association Confirm endpoint for the User",
			}),
		},
	);
