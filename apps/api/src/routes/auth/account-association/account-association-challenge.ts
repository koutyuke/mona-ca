import { Elysia, t } from "elysia";
import { env } from "../../../core/infra/config/env";
import {
	CookieManager,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	UnauthorizedException,
	withBaseResponseSchema,
} from "../../../core/infra/elysia";
import { ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME } from "../../../core/lib/http";
import { newAccountAssociationSessionToken } from "../../../features/auth";
import { di } from "../../../plugins/di";
import { pathDetail } from "../../../plugins/open-api/path-detail";
import { RateLimiterSchema, rateLimit } from "../../../plugins/rate-limit";
import { WithClientTypeSchema, withClientType } from "../../../plugins/with-client-type";

export const AccountAssociationChallenge = new Elysia()
	// Local Middleware & Plugin
	.use(di())
	.use(
		rateLimit("account-association-challenge", {
			maxTokens: 1000,
			refillRate: 500,
			refillInterval: {
				value: 10,
				unit: "m",
			},
		}),
	)
	.use(withClientType)

	// Route
	.post(
		"/association",
		async ({ containers, cookie, body, clientType, rateLimit }) => {
			const cookieManager = new CookieManager(env.APP_ENV === "production", cookie);

			const rawAccountAssociationSessionToken =
				clientType === "web"
					? cookieManager.getCookie(ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME)
					: body?.accountAssociationSessionToken;

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

			const { accountAssociationSession: validateAccountAssociationSession } = validateResult.value;

			await rateLimit.consume(validateAccountAssociationSession.userId, 100);

			const { accountAssociationSessionToken, accountAssociationSession } =
				await containers.auth.accountAssociationChallengeUseCase.execute(validateAccountAssociationSession);

			if (clientType === "mobile") {
				return {
					accountAssociationSessionToken,
				};
			}

			cookieManager.setCookie(ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME, accountAssociationSessionToken, {
				expires: accountAssociationSession.expiresAt,
			});

			return NoContentResponse();
		},
		{
			beforeHandle: async ({ rateLimit, ip }) => {
				await rateLimit.consume(ip, 1);
			},
			headers: WithClientTypeSchema.headers,
			cookie: t.Cookie({
				[ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Optional(
				t.Object({
					accountAssociationSessionToken: t.Optional(t.String()),
				}),
			),
			response: withBaseResponseSchema({
				200: t.Object({
					accountAssociationSessionToken: t.String(),
				}),
				204: NoContentResponseSchema,
				400: WithClientTypeSchema.response[400],
				401: ResponseTUnion(
					ErrorResponseSchema("ACCOUNT_ASSOCIATION_SESSION_INVALID"),
					ErrorResponseSchema("ACCOUNT_ASSOCIATION_SESSION_EXPIRED"),
				),
				429: RateLimiterSchema.response[429],
			}),
			detail: pathDetail({
				tag: "Auth - Account Association",
				operationId: "account-association-challenge",
				summary: "Account Association Challenge",
				description: "Account Association Challenge endpoint for the User",
			}),
		},
	);
