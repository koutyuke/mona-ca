import { t } from "elysia";
import { AccountAssociationSessionRepository } from "../../../features/auth/adapters/repositories/account-association-session/account-association-session.repository";
import { AuthUserRepository } from "../../../features/auth/adapters/repositories/auth-user/auth-user.repository";
import { AccountAssociationChallengeUseCase } from "../../../features/auth/application/use-cases/account-association/account-association-challenge.usecase";
import { ValidateAccountAssociationSessionUseCase } from "../../../features/auth/application/use-cases/account-association/validate-account-association-session.usecase";
import { newAccountAssociationSessionToken } from "../../../features/auth/domain/value-objects/session-token";
import { CookieManager } from "../../../plugins/cookie";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../../plugins/elysia-with-env";
import { UnauthorizedException } from "../../../plugins/error";
import { pathDetail } from "../../../plugins/open-api/path-detail";
import { RateLimiterSchema, rateLimit } from "../../../plugins/rate-limit";
import { WithClientTypeSchema, withClientType } from "../../../plugins/with-client-type";
import { EmailGateway } from "../../../shared/adapters/gateways/email";
import { RandomGenerator, SessionSecretHasher } from "../../../shared/infra/crypto";
import { DrizzleService } from "../../../shared/infra/drizzle";
import { ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME } from "../../../shared/lib/http";

export const AccountAssociationChallenge = new ElysiaWithEnv()
	// Local Middleware & Plugin
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
		async ({ env: { APP_ENV, RESEND_API_KEY }, cfModuleEnv: { DB }, cookie, body, clientType, rateLimit }) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const accountAssociationSessionRepository = new AccountAssociationSessionRepository(drizzleService);
			const authUserRepository = new AuthUserRepository(drizzleService);

			const emailGateway = new EmailGateway(APP_ENV === "production", RESEND_API_KEY);
			const sessionSecretHasher = new SessionSecretHasher();
			const randomGenerator = new RandomGenerator();

			const accountAssociationChallengeUseCase = new AccountAssociationChallengeUseCase(
				accountAssociationSessionRepository,
				sessionSecretHasher,
				randomGenerator,
				emailGateway,
			);
			const validateAccountAssociationSessionUseCase = new ValidateAccountAssociationSessionUseCase(
				authUserRepository,
				accountAssociationSessionRepository,
				sessionSecretHasher,
			);
			// === End of instances ===

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

			const validateResult = await validateAccountAssociationSessionUseCase.execute(
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
				await accountAssociationChallengeUseCase.execute(validateAccountAssociationSession);

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
