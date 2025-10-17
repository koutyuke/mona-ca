import { t } from "elysia";
import { SendEmailUseCase } from "../../../common/adapters/gateways/email";
import { verificationEmailTemplate } from "../../../common/adapters/gateways/email/mail-context";
import { CookieManager } from "../../../features/auth/adapters/http/cookie";
import { EmailVerificationSessionRepository } from "../../../features/auth/adapters/repositories/email-verification-session";
import { EmailVerificationRequestUseCase } from "../../../features/auth/application/use-cases/email-verification";
import { UserRepository } from "../../../features/user/adapters/repositories/user";
import { RandomGenerator, SessionSecretHasher } from "../../../infrastructure/crypto";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { EMAIL_VERIFICATION_SESSION_COOKIE_NAME } from "../../../lib/constants";
import { AuthGuardSchema, authGuard } from "../../../plugins/auth-guard";
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
			user,
			clientType,
			rateLimit,
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const emailVerificationSessionRepository = new EmailVerificationSessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const randomGenerator = new RandomGenerator();
			const sessionSecretHasher = new SessionSecretHasher();

			const sendEmailUseCase = new SendEmailUseCase(APP_ENV === "production", RESEND_API_KEY);
			const emailVerificationRequestUseCase = new EmailVerificationRequestUseCase(
				userRepository,
				emailVerificationSessionRepository,
				randomGenerator,
				sessionSecretHasher,
			);
			// === End of instances ===

			const email = bodyEmail ?? user.email;

			await rateLimit.consume(email, 100);

			const result = await emailVerificationRequestUseCase.execute(email, user);

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

			const mailContents = verificationEmailTemplate(emailVerificationSession.email, emailVerificationSession.code);

			await sendEmailUseCase.sendEmail({
				from: mailContents.from,
				to: mailContents.to,
				subject: mailContents.subject,
				text: mailContents.text,
			});

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
			beforeHandle: async ({ rateLimit, user }) => {
				await rateLimit.consume(user.id, 1);
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
