import { t } from "elysia";
import { SessionSecretService } from "../../../application/services/session";
import { AccountAssociationChallengeUseCase } from "../../../application/use-cases/account-association";
import { ValidateAccountAssociationSessionUseCase } from "../../../application/use-cases/account-association/validate-account-association-session.usecase";
import { SendEmailUseCase } from "../../../application/use-cases/email";
import { verificationEmailTemplate } from "../../../application/use-cases/email/mail-context";
import { ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME } from "../../../common/constants";
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
			env: { ACCOUNT_ASSOCIATION_SESSION_PEPPER, APP_ENV, RESEND_API_KEY },
			cfModuleEnv: { DB },
			cookie,
			body,
			clientType,
			rateLimit,
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const accountAssociationSessionSecretService = new SessionSecretService(ACCOUNT_ASSOCIATION_SESSION_PEPPER);

			const accountAssociationSessionRepository = new AccountAssociationSessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const sendEmailUseCase = new SendEmailUseCase(APP_ENV === "production", RESEND_API_KEY);
			const accountAssociationChallengeUseCase = new AccountAssociationChallengeUseCase(
				accountAssociationSessionSecretService,
				accountAssociationSessionRepository,
				userRepository,
			);
			const validateAccountAssociationSessionUseCase = new ValidateAccountAssociationSessionUseCase(
				userRepository,
				accountAssociationSessionRepository,
				accountAssociationSessionSecretService,
			);
			// === End of instances ===

			const accountAssociationSessionToken =
				clientType === "web"
					? cookieManager.getCookie(ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME)
					: body?.accountAssociationSessionToken;

			if (!accountAssociationSessionToken) {
				throw new BadRequestException({
					code: "INVALID_STATE",
				});
			}

			const validateResult = await validateAccountAssociationSessionUseCase.execute(accountAssociationSessionToken);

			if (isErr(validateResult)) {
				throw new BadRequestException({
					code: validateResult.code,
				});
			}

			await rateLimit.consume(validateResult.user.id, 10);

			const challengeResult = await accountAssociationChallengeUseCase.execute(
				validateResult.accountAssociationSession,
			);

			if (isErr(challengeResult)) {
				throw new BadRequestException({
					code: challengeResult.code,
				});
			}

			const { accountAssociationSessionToken: newAccountAssociationSessionToken, accountAssociationSession } =
				challengeResult;

			if (!accountAssociationSession.code) {
				throw new Error("Dev: Code is not set");
			}

			const mailContents = verificationEmailTemplate(accountAssociationSession.email, accountAssociationSession.code);

			await sendEmailUseCase.execute({
				from: mailContents.from,
				to: mailContents.to,
				subject: mailContents.subject,
				text: mailContents.text,
			});

			if (clientType === "mobile") {
				return {
					accountAssociationSessionToken: newAccountAssociationSessionToken,
				};
			}

			cookieManager.setCookie(ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME, newAccountAssociationSessionToken, {
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
