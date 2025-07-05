import { t } from "elysia";
import { SessionSecretService } from "../../../application/services/session";
import { AccountAssociationChallengeUseCase } from "../../../application/use-cases/account-association";
import { ValidateAccountAssociationSessionUseCase } from "../../../application/use-cases/account-association/validate-account-association-session.usecase";
import { SendEmailUseCase } from "../../../application/use-cases/email";
import { verificationEmailTemplate } from "../../../application/use-cases/email/mail-context";
import { ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME } from "../../../common/constants";
import { isErr } from "../../../common/utils";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { AccountAssociationSessionRepository } from "../../../interface-adapter/repositories/account-association-session";
import { UserRepository } from "../../../interface-adapter/repositories/user";
import { CookieManager } from "../../../modules/cookie";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	InternalServerErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
} from "../../../modules/elysia-with-env";
import { BadRequestException, UnauthorizedException } from "../../../modules/error";
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
				throw new UnauthorizedException({
					code: "ACCOUNT_ASSOCIATION_SESSION_INVALID",
					message: "Account association session not found. Please login again.",
				});
			}

			const validateResult = await validateAccountAssociationSessionUseCase.execute(accountAssociationSessionToken);

			if (isErr(validateResult)) {
				const { code } = validateResult;

				switch (code) {
					case "ACCOUNT_ASSOCIATION_SESSION_INVALID":
						throw new UnauthorizedException({
							code: code,
							message: "Invalid account association session. Please login again.",
						});
					case "ACCOUNT_ASSOCIATION_SESSION_EXPIRED":
						throw new UnauthorizedException({
							code: code,
							message: "Account association session has expired. Please login again.",
						});
					default:
						throw new BadRequestException({
							code: code,
							message: "Account association session validation failed. Please try again.",
						});
				}
			}

			await rateLimit.consume(validateResult.user.id, 10);

			const { accountAssociationSessionToken: newAccountAssociationSessionToken, accountAssociationSession } =
				await accountAssociationChallengeUseCase.execute(validateResult.user, validateResult.accountAssociationSession);

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
				400: WithClientTypeSchema.response[400],
				401: ResponseTUnion(
					ErrorResponseSchema("ACCOUNT_ASSOCIATION_SESSION_INVALID"),
					ErrorResponseSchema("ACCOUNT_ASSOCIATION_SESSION_EXPIRED"),
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
