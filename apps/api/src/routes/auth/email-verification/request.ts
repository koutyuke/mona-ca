import { t } from "elysia";
import { EmailVerificationRequestUseCase } from "../../../features/auth";
import { AuthUserRepository } from "../../../features/auth/adapters/repositories/auth-user/auth-user.repository";
import { EmailVerificationSessionRepository } from "../../../features/auth/adapters/repositories/email-verification-session/email-verification-session.repository";
import { AuthGuardSchema, authGuard } from "../../../plugins/auth-guard";
import { CookieManager } from "../../../plugins/cookie";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../../plugins/elysia-with-env";
import { BadRequestException } from "../../../plugins/error";
import { pathDetail } from "../../../plugins/open-api";
import { RateLimiterSchema, rateLimit } from "../../../plugins/rate-limit";
import { EmailGateway } from "../../../shared/adapters/gateways/email";
import { RandomGenerator, SessionSecretHasher } from "../../../shared/infra/crypto";
import { DrizzleService } from "../../../shared/infra/drizzle";
import { EMAIL_VERIFICATION_SESSION_COOKIE_NAME } from "../../../shared/lib/http";

const EmailVerificationRequest = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(authGuard({ requireEmailVerification: false }))
	.use(
		rateLimit("email-verification-request", {
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
		"",
		async ({
			cfModuleEnv: { DB },
			env: { APP_ENV, RESEND_API_KEY },
			cookie,
			body: { email: bodyEmail },
			userIdentity,
			clientType,
			rateLimit,
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const emailVerificationSessionRepository = new EmailVerificationSessionRepository(drizzleService);
			const authUserRepository = new AuthUserRepository(drizzleService);
			const emailGateway = new EmailGateway(APP_ENV === "production", RESEND_API_KEY);

			const randomGenerator = new RandomGenerator();
			const sessionSecretHasher = new SessionSecretHasher();

			const emailVerificationRequestUseCase = new EmailVerificationRequestUseCase(
				emailVerificationSessionRepository,
				authUserRepository,
				randomGenerator,
				sessionSecretHasher,
				emailGateway,
			);
			// === End of instances ===

			const email = bodyEmail ?? userIdentity.email;

			await rateLimit.consume(email, 100);

			const result = await emailVerificationRequestUseCase.execute(email, userIdentity);

			if (result.isErr) {
				const { code } = result;

				if (code === "EMAIL_ALREADY_VERIFIED") {
					throw new BadRequestException({
						code: code,
						message: "Email is already verified. Please use a different email address.",
					});
				}
				if (code === "EMAIL_ALREADY_REGISTERED") {
					throw new BadRequestException({
						code: code,
						message: "Email is already registered by another user. Please use a different email address.",
					});
				}
			}

			const { emailVerificationSession, emailVerificationSessionToken } = result.value;

			if (clientType === "mobile") {
				return {
					emailVerificationSessionToken,
				};
			}

			cookieManager.setCookie(EMAIL_VERIFICATION_SESSION_COOKIE_NAME, emailVerificationSessionToken, {
				expires: emailVerificationSession.expiresAt,
			});

			return NoContentResponse();
		},
		{
			beforeHandle: async ({ rateLimit, userIdentity }) => {
				await rateLimit.consume(userIdentity.id, 1);
			},
			headers: AuthGuardSchema.headers,
			cookie: t.Cookie({
				[EMAIL_VERIFICATION_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				email: t.Nullable(
					t.String({
						format: "email",
					}),
				),
			}),
			response: withBaseResponseSchema({
				200: t.Object({
					emailVerificationSessionToken: t.String(),
				}),
				204: NoContentResponseSchema,
				400: ResponseTUnion(
					AuthGuardSchema.response[400],
					ErrorResponseSchema("EMAIL_ALREADY_VERIFIED"),
					ErrorResponseSchema("EMAIL_ALREADY_REGISTERED"),
				),
				401: AuthGuardSchema.response[401],
				429: RateLimiterSchema.response[429],
			}),
			detail: pathDetail({
				operationId: "auth-email-verification-request",
				summary: "Email Verification Request",
				description: "The User can request email verification by this endpoint",
				tag: "Auth - Email Verification",
				withAuth: true,
			}),
		},
	);

export { EmailVerificationRequest };
