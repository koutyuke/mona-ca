import { t } from "elysia";
import { SendEmailUseCase } from "../../../common/adapters/gateways/email";
import { verificationEmailTemplate } from "../../../common/adapters/gateways/email/mail-context";
import { newAccountAssociationSessionToken } from "../../../common/domain/value-objects";
import { CookieManager } from "../../../features/auth/adapters/http/cookie";
import { AccountAssociationSessionRepository } from "../../../features/auth/adapters/repositories/account-association-session";
import { AccountAssociationChallengeUseCase } from "../../../features/auth/application/use-cases/account-association";
import { ValidateAccountAssociationSessionUseCase } from "../../../features/auth/application/use-cases/account-association/validate-account-association-session.usecase";
import { UserRepository } from "../../../features/user/adapters/repositories/user";
import { RandomGenerator, SessionSecretHasher } from "../../../infrastructure/crypto";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME } from "../../../lib/constants";
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
			const userRepository = new UserRepository(drizzleService);

			const sessionSecretHasher = new SessionSecretHasher();
			const randomGenerator = new RandomGenerator();

			const sendEmailUseCase = new SendEmailUseCase(APP_ENV === "production", RESEND_API_KEY);
			const accountAssociationChallengeUseCase = new AccountAssociationChallengeUseCase(
				accountAssociationSessionRepository,
				sessionSecretHasher,
				randomGenerator,
			);
			const validateAccountAssociationSessionUseCase = new ValidateAccountAssociationSessionUseCase(
				userRepository,
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

			const { accountAssociationSession: validateAccountAssociationSession, user } = validateResult.value;

			await rateLimit.consume(user.id, 100);

			const { accountAssociationSessionToken, accountAssociationSession } =
				await accountAssociationChallengeUseCase.execute(user, validateAccountAssociationSession);

			const mailContents = verificationEmailTemplate(
				accountAssociationSession.email,
				accountAssociationSession.code ?? "",
			);

			await sendEmailUseCase.sendEmail({
				from: mailContents.from,
				to: mailContents.to,
				subject: mailContents.subject,
				text: mailContents.text,
			});

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
