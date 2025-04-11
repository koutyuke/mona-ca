import { t } from "elysia";
import { SessionTokenService } from "../../../application/services/session-token";
import { EmailVerificationConfirmUseCase } from "../../../application/use-cases/email-verification";
import { SESSION_COOKIE_NAME } from "../../../common/constants";
import { isErr } from "../../../common/utils";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { EmailVerificationSessionRepository } from "../../../interface-adapter/repositories/email-verification-session";
import { SessionRepository } from "../../../interface-adapter/repositories/session";
import { UserRepository } from "../../../interface-adapter/repositories/user";
import { AuthGuardSchema, authGuard } from "../../../modules/auth-guard";
import { CookieService } from "../../../modules/cookie";
import { ElysiaWithEnv, NoContentResponse, NoContentResponseSchema } from "../../../modules/elysia-with-env";
import { BadRequestException, InternalServerErrorResponseSchema } from "../../../modules/error";
import { pathDetail } from "../../../modules/open-api";
import { RateLimiterSchema, rateLimiter } from "../../../modules/rate-limiter";
import { WithClientTypeSchema, withClientType } from "../../../modules/with-client-type";

const cookieSchemaObject = {
	[SESSION_COOKIE_NAME]: t.Optional(t.String()),
};

const EmailVerificationConfirm = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(withClientType)
	.use(authGuard({ requireEmailVerification: false }))
	.use(
		rateLimiter("email-verification-confirm", {
			maxTokens: 10,
			refillRate: 10,
			refillInterval: {
				value: 30,
				unit: "m",
			},
		}),
	)

	// Route
	.post(
		"/confirm",
		async ({
			env: { APP_ENV, EMAIL_VERIFICATION_SESSION_PEPPER },
			cfModuleEnv: { DB },
			cookie,
			body: { code, emailVerificationSessionToken },
			user,
			clientType,
		}) => {
			const drizzleService = new DrizzleService(DB);
			const cookieService = new CookieService(APP_ENV === "production", cookie, cookieSchemaObject);

			const emailVerificationSessionRepository = new EmailVerificationSessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);
			const sessionRepository = new SessionRepository(drizzleService);

			const sessionTokenService = new SessionTokenService(EMAIL_VERIFICATION_SESSION_PEPPER);

			const emailVerificationConfirmUseCase = new EmailVerificationConfirmUseCase(
				sessionTokenService,
				emailVerificationSessionRepository,
				userRepository,
				sessionRepository,
			);

			const result = await emailVerificationConfirmUseCase.execute(emailVerificationSessionToken, code, user);

			if (isErr(result)) {
				const { code } = result;

				throw new BadRequestException({
					name: code,
					message: "Failed to confirm user email verification.",
				});
			}

			const { sessionToken, session } = result;

			if (clientType === "mobile") {
				return {
					sessionToken,
				};
			}

			cookieService.setCookie(SESSION_COOKIE_NAME, sessionToken, {
				expires: session.expiresAt,
			});

			return NoContentResponse;
		},
		{
			beforeHandle: async ({ rateLimiter, user }) => {
				await rateLimiter.consume(user.id, 1);
			},
			headers: WithClientTypeSchema.headers,
			cookie: t.Cookie(cookieSchemaObject),
			body: t.Object({
				code: t.String(),
				emailVerificationSessionToken: t.String(),
			}),
			response: {
				200: t.Object({
					sessionToken: t.String(),
				}),
				204: NoContentResponseSchema,
				400: WithClientTypeSchema.response[400],
				401: AuthGuardSchema.response[401],
				429: RateLimiterSchema.response[429],
				500: InternalServerErrorResponseSchema,
			},
			detail: pathDetail({
				operationId: "auth-email-verification-confirm",
				summary: "Email Verification Confirm",
				description: "The User can confirm email verification by this endpoint",
				tag: "Auth - Email Verification",
				withAuth: true,
			}),
		},
	);

export { EmailVerificationConfirm };
