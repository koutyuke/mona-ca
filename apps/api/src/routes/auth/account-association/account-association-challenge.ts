import { t } from "elysia";
import { SessionTokenService } from "../../../application/services/session-token";
import { AccountAssociationChallengeUseCase } from "../../../application/use-cases/account-association";
import { SendEmailUseCase } from "../../../application/use-cases/email";
import { verificationEmailTemplate } from "../../../application/use-cases/email/mail-context";
import {
	ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME,
	ACCOUNT_ASSOCIATION_STATE_COOKIE_NAME,
} from "../../../common/constants";
import { FlattenUnion } from "../../../common/schemas";
import { isErr } from "../../../common/utils";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { AccountAssociationSessionRepository } from "../../../interface-adapter/repositories/account-association-session";
import { UserRepository } from "../../../interface-adapter/repositories/user";
import { CookieManager } from "../../../modules/cookie";
import { ElysiaWithEnv, NoContentResponse, NoContentResponseSchema } from "../../../modules/elysia-with-env";
import { BadRequestException, ErrorResponseSchema, InternalServerErrorResponseSchema } from "../../../modules/error";
import { pathDetail } from "../../../modules/open-api/path-detail";
import { RateLimiterSchema, rateLimit } from "../../../modules/rate-limit";
import { WithClientTypeSchema, withClientType } from "../../../modules/with-client-type";

export const AccountAssociationChallenge = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(
		rateLimit("account-association-challenge", {
			maxTokens: 100,
			refillRate: 50,
			refillInterval: {
				value: 30,
				unit: "m",
			},
		}),
	)
	.use(withClientType)

	// Route
	.post(
		"/association/challenge",
		async ({
			env: { ACCOUNT_ASSOCIATION_SESSION_PEPPER, ACCOUNT_ASSOCIATION_STATE_HMAC_SECRET, APP_ENV, RESEND_API_KEY },
			cfModuleEnv: { DB },
			cookie,
			body,
			clientType,
			rateLimit,
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const accountAssociationSessionTokenService = new SessionTokenService(ACCOUNT_ASSOCIATION_SESSION_PEPPER);

			const accountAssociationSessionRepository = new AccountAssociationSessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const sendEmailUseCase = new SendEmailUseCase(APP_ENV === "production", RESEND_API_KEY);
			const accountAssociationChallengeUseCase = new AccountAssociationChallengeUseCase(
				{ ACCOUNT_ASSOCIATION_STATE_HMAC_SECRET },
				accountAssociationSessionTokenService,
				accountAssociationSessionRepository,
				userRepository,
			);
			// === End of instances ===

			let stateOrSessionToken: string | undefined = undefined;

			if (clientType === "web") {
				stateOrSessionToken =
					cookieManager.getCookie(ACCOUNT_ASSOCIATION_STATE_COOKIE_NAME) ??
					cookieManager.getCookie(ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME);
			} else {
				stateOrSessionToken = body?.accountAssociationState ?? body?.accountAssociationSessionToken;
			}

			if (!stateOrSessionToken) {
				throw new BadRequestException({
					code: "INVALID_STATE",
				});
			}

			const result = await accountAssociationChallengeUseCase.execute(stateOrSessionToken, async userId => {
				await rateLimit.consume(userId, 10);
			});

			if (isErr(result)) {
				throw new BadRequestException({
					code: result.code,
				});
			}

			const { accountAssociationSessionToken, accountAssociationSession } = result;

			const mailContents = verificationEmailTemplate(accountAssociationSession.email, accountAssociationSession.code);

			await sendEmailUseCase.execute({
				from: mailContents.from,
				to: mailContents.to,
				subject: mailContents.subject,
				text: mailContents.text,
			});

			if (clientType === "mobile") {
				return {
					accountAssociationSessionToken: accountAssociationSessionToken,
				};
			}

			cookieManager.deleteCookie(ACCOUNT_ASSOCIATION_STATE_COOKIE_NAME);
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
				[ACCOUNT_ASSOCIATION_STATE_COOKIE_NAME]: t.Optional(t.String()),
				[ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Optional(
				t.Object({
					accountAssociationState: t.Optional(t.String()),
					accountAssociationSessionToken: t.Optional(t.String()),
				}),
			),
			response: {
				200: t.Object({
					accountAssociationSessionToken: t.String(),
				}),
				204: NoContentResponseSchema,
				400: FlattenUnion(
					WithClientTypeSchema.response[400],
					ErrorResponseSchema("USER_NOT_FOUND"),
					ErrorResponseSchema("INVALID_STATE_OR_SESSION_TOKEN"),
					ErrorResponseSchema("EXPIRED_STATE_OR_SESSION_TOKEN"),
				),
				429: RateLimiterSchema.response[429],
				500: InternalServerErrorResponseSchema,
			},
			detail: pathDetail({
				tag: "Auth - Account Association",
				operationId: "account-association-challenge",
				summary: "Account Association Challenge",
				description: "Account Association Challenge endpoint for the User",
			}),
		},
	);
