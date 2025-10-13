import { t } from "elysia";
import {
	EmailVerificationConfirmUseCase,
	ValidateEmailVerificationSessionUseCase,
} from "../../../application/use-cases/email-verification";
import { EMAIL_VERIFICATION_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from "../../../common/constants";
import { isErr } from "../../../common/utils";
import { newEmailVerificationSessionToken } from "../../../domain/value-object";
import { SessionSecretHasher } from "../../../infrastructure/crypt";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { EmailVerificationSessionRepository } from "../../../interface-adapter/repositories/email-verification-session";
import { SessionRepository } from "../../../interface-adapter/repositories/session";
import { UserRepository } from "../../../interface-adapter/repositories/user";
import { AuthGuardSchema, authGuard } from "../../../modules/auth-guard";
import { CookieManager } from "../../../modules/cookie";
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

const EmailVerificationConfirm = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(authGuard({ requireEmailVerification: false }))
	.use(
		rateLimit("email-verification-confirm", {
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
		"/confirm",
		async ({
			env: { APP_ENV },
			cfModuleEnv: { DB },
			cookie,
			body: { code, emailVerificationSessionToken: bodyEmailVerificationSessionToken },
			user,
			clientType,
			rateLimit,
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const emailVerificationSessionRepository = new EmailVerificationSessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);
			const sessionRepository = new SessionRepository(drizzleService);

			const sessionSecretHasher = new SessionSecretHasher();

			const validateEmailVerificationSessionUseCase = new ValidateEmailVerificationSessionUseCase(
				emailVerificationSessionRepository,
				sessionSecretHasher,
			);
			const emailVerificationConfirmUseCase = new EmailVerificationConfirmUseCase(
				userRepository,
				sessionRepository,
				emailVerificationSessionRepository,
				sessionSecretHasher,
			);
			// === End of Instances ===

			const rawEmailVerificationSessionToken =
				clientType === "web"
					? cookieManager.getCookie(EMAIL_VERIFICATION_SESSION_COOKIE_NAME)
					: bodyEmailVerificationSessionToken;

			if (!rawEmailVerificationSessionToken) {
				throw new UnauthorizedException({
					code: "EMAIL_VERIFICATION_SESSION_INVALID",
					message: "Email verification session token not found. Please request email verification again.",
				});
			}

			const validationResult = await validateEmailVerificationSessionUseCase.execute(
				newEmailVerificationSessionToken(rawEmailVerificationSessionToken),
				user,
			);

			if (isErr(validationResult)) {
				const { code } = validationResult;

				if (code === "EMAIL_VERIFICATION_SESSION_INVALID") {
					throw new UnauthorizedException({
						code: code,
						message: "Invalid email verification session. Please request email verification again.",
					});
				}
				if (code === "EMAIL_VERIFICATION_SESSION_EXPIRED") {
					throw new UnauthorizedException({
						code: code,
						message: "Email verification session has expired. Please request email verification again.",
					});
				}
			}

			const { emailVerificationSession } = validationResult;

			await rateLimit.consume(emailVerificationSession.id, 100);

			const confirmResult = await emailVerificationConfirmUseCase.execute(code, user, emailVerificationSession);

			if (isErr(confirmResult)) {
				const { code } = confirmResult;

				if (code === "INVALID_VERIFICATION_CODE") {
					throw new BadRequestException({
						code: code,
						message: "Invalid verification code. Please check your email and try again.",
					});
				}
				if (code === "EMAIL_MISMATCH") {
					throw new BadRequestException({
						code: code,
						message: "Email mismatch. Please use the email address you requested verification for.",
					});
				}
			}

			const { sessionToken, session } = confirmResult;

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
			response: withBaseResponseSchema({
				200: t.Object({
					sessionToken: t.String(),
				}),
				204: NoContentResponseSchema,
				400: ResponseTUnion(
					AuthGuardSchema.response[400],
					ErrorResponseSchema("INVALID_VERIFICATION_CODE"),
					ErrorResponseSchema("EMAIL_MISMATCH"),
				),
				401: ResponseTUnion(
					AuthGuardSchema.response[401],
					ErrorResponseSchema("EMAIL_VERIFICATION_SESSION_INVALID"),
					ErrorResponseSchema("EMAIL_VERIFICATION_SESSION_EXPIRED"),
				),
				429: RateLimiterSchema.response[429],
			}),
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
