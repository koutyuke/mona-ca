import { t } from "elysia";
import { SessionTokenService } from "../../../application/services/session-token";
import { SendEmailUseCase } from "../../../application/use-cases/email";
import { EmailVerificationRequestUseCase } from "../../../application/use-cases/email-verification";
import { verificationEmailTemplate } from "../../../application/use-cases/email/mail-context";
import { EMAIL_VERIFICATION_SESSION_COOKIE_NAME } from "../../../common/constants";
import { FlattenUnion } from "../../../common/schema";
import { isErr } from "../../../common/utils";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { EmailVerificationSessionRepository } from "../../../interface-adapter/repositories/email-verification-session";
import { UserRepository } from "../../../interface-adapter/repositories/user";
import { AuthGuardSchema, authGuard } from "../../../modules/auth-guard";
import { CookieService } from "../../../modules/cookie";
import { ElysiaWithEnv, NoContentResponse, NoContentResponseSchema } from "../../../modules/elysia-with-env";
import { BadRequestException, ErrorResponseSchema, InternalServerErrorResponseSchema } from "../../../modules/error";
import { pathDetail } from "../../../modules/open-api";
import { RateLimiterSchema, rateLimiter } from "../../../modules/rate-limiter";

const cookieSchemaObject = {
	[EMAIL_VERIFICATION_SESSION_COOKIE_NAME]: t.Optional(t.String()),
};

const EmailVerificationRequest = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(authGuard({ requireEmailVerification: false }))
	.use(
		rateLimiter("email-verification-request", {
			maxTokens: 5,
			refillRate: 5,
			refillInterval: {
				value: 30,
				unit: "m",
			},
		}),
	)

	// Route
	.post(
		"",
		async ({
			cfModuleEnv: { DB },
			env: { APP_ENV, RESEND_API_KEY, EMAIL_VERIFICATION_SESSION_PEPPER },
			cookie,
			body: { email: bodyEmail },
			user,
			clientType,
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieService = new CookieService(APP_ENV === "production", cookie, cookieSchemaObject);

			const emailVerificationSessionRepository = new EmailVerificationSessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const sessionTokenService = new SessionTokenService(EMAIL_VERIFICATION_SESSION_PEPPER);

			const sendEmailUseCase = new SendEmailUseCase(APP_ENV === "production", RESEND_API_KEY);
			const emailVerificationRequestUseCase = new EmailVerificationRequestUseCase(
				emailVerificationSessionRepository,
				userRepository,
				sessionTokenService,
			);
			// === End of instances ===

			const email = bodyEmail ?? user.email;
			const result = await emailVerificationRequestUseCase.execute(email, user);

			if (isErr(result)) {
				const { code } = result;

				throw new BadRequestException({
					name: code,
					message: "Email is already used or verified.",
				});
			}

			const { emailVerificationSession, emailVerificationSessionToken } = result;

			const mailContents = verificationEmailTemplate(emailVerificationSession.email, emailVerificationSession.code);

			await sendEmailUseCase.execute({
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

			cookieService.setCookie(EMAIL_VERIFICATION_SESSION_COOKIE_NAME, emailVerificationSessionToken, {
				expires: emailVerificationSession.expiresAt,
			});

			return NoContentResponse();
		},
		{
			beforeHandle: async ({ rateLimiter, user }) => {
				await rateLimiter.consume(user.id, 1);
			},
			headers: AuthGuardSchema.headers,
			cookie: t.Cookie(cookieSchemaObject),
			body: t.Object({
				email: t.Nullable(
					t.String({
						format: "email",
					}),
				),
			}),
			response: {
				200: t.Object({
					emailVerificationSessionToken: t.String(),
				}),
				204: NoContentResponseSchema,
				400: FlattenUnion(
					AuthGuardSchema.response[400],
					ErrorResponseSchema("EMAIL_IS_ALREADY_VERIFIED"),
					ErrorResponseSchema("EMAIL_IS_ALREADY_USED"),
				),
				401: AuthGuardSchema.response[401],
				429: RateLimiterSchema.response[429],
				500: InternalServerErrorResponseSchema,
			},
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
