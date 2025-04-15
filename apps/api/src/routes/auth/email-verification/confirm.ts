import { t } from "elysia";
import { SessionTokenService } from "../../../application/services/session-token";
import { EmailVerificationConfirmUseCase } from "../../../application/use-cases/email-verification";
import { EMAIL_VERIFICATION_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from "../../../common/constants";
import { FlattenUnion } from "../../../common/schema";
import { isErr } from "../../../common/utils";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { EmailVerificationSessionRepository } from "../../../interface-adapter/repositories/email-verification-session";
import { SessionRepository } from "../../../interface-adapter/repositories/session";
import { UserRepository } from "../../../interface-adapter/repositories/user";
import { AuthGuardSchema, authGuard } from "../../../modules/auth-guard";
import { CookieManager } from "../../../modules/cookie";
import { ElysiaWithEnv, NoContentResponse, NoContentResponseSchema } from "../../../modules/elysia-with-env";
import { BadRequestException, ErrorResponseSchema, InternalServerErrorResponseSchema } from "../../../modules/error";
import { pathDetail } from "../../../modules/open-api";
import { RateLimiterSchema, rateLimit } from "../../../modules/rate-limit";

const EmailVerificationConfirm = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(authGuard({ requireEmailVerification: false }))
	.use(
		rateLimit("email-verification-confirm", {
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
			env: { APP_ENV, EMAIL_VERIFICATION_SESSION_PEPPER, SESSION_PEPPER },
			cfModuleEnv: { DB },
			cookie,
			body: { code, emailVerificationSessionToken: bodyEmailVerificationSessionToken },
			user,
			clientType,
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const emailVerificationSessionRepository = new EmailVerificationSessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);
			const sessionRepository = new SessionRepository(drizzleService);

			const sessionTokenService = new SessionTokenService(SESSION_PEPPER);
			const emailVerificationSessionTokenService = new SessionTokenService(EMAIL_VERIFICATION_SESSION_PEPPER);

			const emailVerificationConfirmUseCase = new EmailVerificationConfirmUseCase(
				emailVerificationSessionRepository,
				userRepository,
				sessionRepository,
				sessionTokenService,
				emailVerificationSessionTokenService,
			);
			// === End of Instances ===

			const emailVerificationSessionToken =
				clientType === "web"
					? cookieManager.getCookie(EMAIL_VERIFICATION_SESSION_COOKIE_NAME)
					: bodyEmailVerificationSessionToken;

			if (!emailVerificationSessionToken) {
				throw new BadRequestException({
					code: "INVALID_TOKEN",
				});
			}

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

			cookieManager.deleteCookie(EMAIL_VERIFICATION_SESSION_COOKIE_NAME);

			cookieManager.setCookie(SESSION_COOKIE_NAME, sessionToken, {
				expires: session.expiresAt,
			});

			return NoContentResponse();
		},
		{
			beforeHandle: async ({ rateLimit, user }) => {
				await rateLimit.consume(user.id, 1);
			},
			headers: AuthGuardSchema.headers,
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
				[EMAIL_VERIFICATION_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				code: t.String(),
				emailVerificationSessionToken: t.Optional(t.String()),
			}),
			response: {
				200: t.Object({
					sessionToken: t.String(),
				}),
				204: NoContentResponseSchema,
				400: FlattenUnion(
					AuthGuardSchema.response[400],
					ErrorResponseSchema("INVALID_TOKEN"),
					ErrorResponseSchema("INVALID_CODE"),
					ErrorResponseSchema("CODE_WAS_EXPIRED"),
					ErrorResponseSchema("NOT_REQUEST"),
					ErrorResponseSchema("INVALID_EMAIL"),
				),
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
