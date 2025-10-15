import { t } from "elysia";
import { AccountAssociationConfirmUseCase } from "../../../application/use-cases/account-association";
import { ValidateAccountAssociationSessionUseCase } from "../../../application/use-cases/account-association";
import { ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from "../../../common/constants";
import { newAccountAssociationSessionToken } from "../../../domain/value-objects";
import { SessionSecretHasher } from "../../../infrastructure/crypto";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { CookieManager } from "../../../interface-adapter/http/cookie";
import { AccountAssociationSessionRepository } from "../../../interface-adapter/repositories/account-association-session";
import { ExternalIdentityRepository } from "../../../interface-adapter/repositories/external-identity";
import { SessionRepository } from "../../../interface-adapter/repositories/session";
import { UserRepository } from "../../../interface-adapter/repositories/user";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../../modules/elysia-with-env";
import { BadRequestException, UnauthorizedException } from "../../../modules/error";
import { pathDetail } from "../../../modules/open-api";
import { RateLimiterSchema, rateLimit } from "../../../modules/rate-limit";
import { WithClientTypeSchema, withClientType } from "../../../modules/with-client-type";

export const AccountAssociationConfirm = new ElysiaWithEnv()
	// Local Middleware & Plugin
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
			env: { APP_ENV },
			cfModuleEnv: { DB },
			clientType,
			rateLimit,
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const sessionRepository = new SessionRepository(drizzleService);
			const accountAssociationSessionRepository = new AccountAssociationSessionRepository(drizzleService);
			const externalIdentityRepository = new ExternalIdentityRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const sessionSecretHasher = new SessionSecretHasher();

			const validateAccountAssociationSessionUseCase = new ValidateAccountAssociationSessionUseCase(
				userRepository,
				accountAssociationSessionRepository,
				sessionSecretHasher,
			);
			const accountAssociationConfirmUseCase = new AccountAssociationConfirmUseCase(
				userRepository,
				sessionRepository,
				externalIdentityRepository,
				accountAssociationSessionRepository,
				sessionSecretHasher,
			);
			// === End of instances ===

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

			const { accountAssociationSession } = validateResult.value;

			await rateLimit.consume(accountAssociationSession.id, 100);

			const confirmResult = await accountAssociationConfirmUseCase.execute(code, accountAssociationSession);

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
				if (code === "USER_NOT_FOUND") {
					throw new BadRequestException({
						code,
						message: "User not found. Please try again.",
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
