import { t } from "elysia";
import {
	UpdateEmailUseCase,
	ValidateEmailVerificationSessionUseCase,
} from "../../application/use-cases/email-verification";
import { EMAIL_VERIFICATION_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from "../../common/constants";
import { isErr } from "../../common/utils";
import { newEmailVerificationSessionToken } from "../../domain/value-object";
import { SessionSecretHasher } from "../../infrastructure/crypt";
import { DrizzleService } from "../../infrastructure/drizzle";
import { EmailVerificationSessionRepository } from "../../interface-adapter/repositories/email-verification-session";
import { SessionRepository } from "../../interface-adapter/repositories/session";
import { UserRepository } from "../../interface-adapter/repositories/user";
import { AuthGuardSchema, authGuard } from "../../modules/auth-guard";
import { CookieManager } from "../../modules/cookie";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../modules/elysia-with-env";
import { BadRequestException } from "../../modules/error";
import { pathDetail } from "../../modules/open-api";
import { rateLimit } from "../../modules/rate-limit";

export const UpdateEmail = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(authGuard({ requireEmailVerification: false }))
	.use(
		rateLimit("me-update-email", {
			maxTokens: 1000,
			refillRate: 500,
			refillInterval: {
				value: 10,
				unit: "m",
			},
		}),
	)

	// Route
	.patch(
		"/email",
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
			const updateEmailUseCase = new UpdateEmailUseCase(
				userRepository,
				sessionRepository,
				emailVerificationSessionRepository,
				sessionSecretHasher,
			);
			// === End of instances ===

			const rawEmailVerificationSessionToken =
				clientType === "web"
					? cookieManager.getCookie(EMAIL_VERIFICATION_SESSION_COOKIE_NAME)
					: bodyEmailVerificationSessionToken;

			if (!rawEmailVerificationSessionToken) {
				throw new BadRequestException({
					code: "EMAIL_VERIFICATION_SESSION_INVALID",
					message: "Email verification session is invalid. Please request a new verification email.",
				});
			}

			const validationResult = await validateEmailVerificationSessionUseCase.execute(
				newEmailVerificationSessionToken(rawEmailVerificationSessionToken),
				user,
			);

			if (isErr(validationResult)) {
				const { code } = validationResult;

				switch (code) {
					case "EMAIL_VERIFICATION_SESSION_EXPIRED":
						throw new BadRequestException({
							code: "EMAIL_VERIFICATION_SESSION_EXPIRED",
							message: "Email verification session has expired. Please request a new verification email.",
						});
					case "EMAIL_VERIFICATION_SESSION_INVALID":
						throw new BadRequestException({
							code: "EMAIL_VERIFICATION_SESSION_INVALID",
							message: "Invalid email verification session. Please request a new verification email.",
						});
					default:
						throw new BadRequestException({
							code: code,
							message: "Failed to validate email verification session. Please try again.",
						});
				}
			}

			const { emailVerificationSession } = validationResult;

			await rateLimit.consume(emailVerificationSession.id, 100);

			const updateResult = await updateEmailUseCase.execute(code, user, emailVerificationSession);

			if (isErr(updateResult)) {
				const { code } = updateResult;

				switch (code) {
					case "EMAIL_ALREADY_REGISTERED":
						throw new BadRequestException({
							code: "EMAIL_ALREADY_REGISTERED",
							message: "Email is already in use by another account. Please use a different email address.",
						});
					case "INVALID_VERIFICATION_CODE":
						throw new BadRequestException({
							code: "INVALID_VERIFICATION_CODE",
							message: "Invalid verification code. Please check the code and try again.",
						});
					default:
						throw new BadRequestException({
							code: code,
							message: "Failed to update email. Please try again.",
						});
				}
			}

			const { session, sessionToken } = updateResult;

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
					ErrorResponseSchema("EMAIL_ALREADY_REGISTERED"),
					ErrorResponseSchema("EMAIL_VERIFICATION_SESSION_EXPIRED"),
					ErrorResponseSchema("EMAIL_VERIFICATION_SESSION_INVALID"),
					ErrorResponseSchema("INVALID_VERIFICATION_CODE"),
				),
				401: AuthGuardSchema.response[401],
			}),
			detail: pathDetail({
				operationId: "me-update-email",
				summary: "Update Email",
				description: "Update Email endpoint for the User",
				tag: "Me",
				withAuth: true,
			}),
		},
	);
