import { t } from "elysia";
import { SessionTokenService } from "../../../application/services/session-token";
import { AccountAssociationConfirmUseCase } from "../../../application/use-cases/account-association";
import { ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from "../../../common/constants";
import { FlattenUnion } from "../../../common/schemas";
import { isErr } from "../../../common/utils";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { AccountAssociationSessionRepository } from "../../../interface-adapter/repositories/account-association-session";
import { OAuthAccountRepository } from "../../../interface-adapter/repositories/oauth-account";
import { SessionRepository } from "../../../interface-adapter/repositories/session";
import { CookieManager } from "../../../modules/cookie";
import { ElysiaWithEnv, NoContentResponse, NoContentResponseSchema } from "../../../modules/elysia-with-env";
import { BadRequestException, ErrorResponseSchema, InternalServerErrorResponseSchema } from "../../../modules/error";
import { pathDetail } from "../../../modules/open-api";
import { RateLimiterSchema, rateLimit } from "../../../modules/rate-limit";
import { WithClientTypeSchema, withClientType } from "../../../modules/with-client-type";

export const AccountAssociationConfirm = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(withClientType)
	.use(
		rateLimit("forgot-password-verify-email", {
			maxTokens: 100,
			refillRate: 50,
			refillInterval: {
				value: 30,
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
			env: { SESSION_PEPPER, ACCOUNT_ASSOCIATION_SESSION_PEPPER, APP_ENV },
			cfModuleEnv: { DB },
			clientType,
			rateLimit,
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const sessionTokenService = new SessionTokenService(SESSION_PEPPER);
			const accountAssociationSessionTokenService = new SessionTokenService(ACCOUNT_ASSOCIATION_SESSION_PEPPER);

			const sessionRepository = new SessionRepository(drizzleService);
			const accountAssociationSessionRepository = new AccountAssociationSessionRepository(drizzleService);
			const oauthAccountRepository = new OAuthAccountRepository(drizzleService);

			const accountAssociationConfirmUseCase = new AccountAssociationConfirmUseCase(
				sessionTokenService,
				accountAssociationSessionTokenService,
				sessionRepository,
				accountAssociationSessionRepository,
				oauthAccountRepository,
				async accountAssociationSessionId => {
					await rateLimit.consume(accountAssociationSessionId, 10);
				},
			);
			// === End of instances ===

			const accountAssociationSessionToken =
				clientType === "web"
					? cookieManager.getCookie(ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME)
					: bodyAccountAssociationSessionToken;

			if (!accountAssociationSessionToken) {
				throw new BadRequestException({
					code: "INVALID_STATE",
				});
			}

			const result = await accountAssociationConfirmUseCase.execute(accountAssociationSessionToken, code);

			if (isErr(result)) {
				throw new BadRequestException({
					code: result.code,
				});
			}

			const { sessionToken, session } = result;

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
				accountAssociationSessionToken: t.String(),
				code: t.String(),
			}),
			response: {
				200: t.Object({
					sessionToken: t.String(),
				}),
				204: NoContentResponseSchema,
				400: FlattenUnion(
					WithClientTypeSchema.response[400],
					ErrorResponseSchema("INVALID_TOKEN"),
					ErrorResponseSchema("EXPIRED_TOKEN"),
					ErrorResponseSchema("INVALID_CODE"),
					ErrorResponseSchema("PROVIDER_ALREADY_LINKED"),
					ErrorResponseSchema("ACCOUNT_ALREADY_LINKED_TO_ANOTHER_USER"),
				),
				429: RateLimiterSchema.response[429],
				500: InternalServerErrorResponseSchema,
			},
			detail: pathDetail({
				tag: "Auth - Account Association",
				operationId: "auth-account-association-confirm",
				summary: "Account Association Confirm",
				description: "Account Association Confirm endpoint for the User",
			}),
		},
	);
