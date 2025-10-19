import { t } from "elysia";
import { UpdateEmailUseCase, ValidateEmailVerificationSessionUseCase } from "../../features/auth";
import { AuthUserRepository } from "../../features/auth/adapters/repositories/auth-user/auth-user.repository";
import { EmailVerificationSessionRepository } from "../../features/auth/adapters/repositories/email-verification-session/email-verification-session.repository";
import { SessionRepository } from "../../features/auth/adapters/repositories/session/session.repository";
import { newEmailVerificationSessionToken } from "../../features/auth/domain/value-objects/session-token";
import { AuthGuardSchema, authGuard } from "../../plugins/auth-guard";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../plugins/elysia-with-env";
import { BadRequestException } from "../../plugins/error";
import { pathDetail } from "../../plugins/open-api";
import { rateLimit } from "../../plugins/rate-limit";
import { SessionSecretHasher } from "../../shared/infra/crypto";
import { DrizzleService } from "../../shared/infra/drizzle";
import { CookieManager } from "../../shared/infra/elysia/cookie";
import { EMAIL_VERIFICATION_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from "../../shared/lib/http";

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
			userIdentity,
			clientType,
			rateLimit,
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const emailVerificationSessionRepository = new EmailVerificationSessionRepository(drizzleService);
			const authUserRepository = new AuthUserRepository(drizzleService);
			const sessionRepository = new SessionRepository(drizzleService);

			const sessionSecretHasher = new SessionSecretHasher();

			const validateEmailVerificationSessionUseCase = new ValidateEmailVerificationSessionUseCase(
				emailVerificationSessionRepository,
				sessionSecretHasher,
			);
			const updateEmailUseCase = new UpdateEmailUseCase(
				authUserRepository,
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
				userIdentity,
				newEmailVerificationSessionToken(rawEmailVerificationSessionToken),
			);

			if (validationResult.isErr) {
				const { code } = validationResult;

				if (code === "EMAIL_VERIFICATION_SESSION_EXPIRED") {
					throw new BadRequestException({
						code: "EMAIL_VERIFICATION_SESSION_EXPIRED",
						message: "Email verification session has expired. Please request a new verification email.",
					});
				}
				if (code === "EMAIL_VERIFICATION_SESSION_INVALID") {
					throw new BadRequestException({
						code: "EMAIL_VERIFICATION_SESSION_INVALID",
						message: "Invalid email verification session. Please request a new verification email.",
					});
				}
			}

			const { emailVerificationSession } = validationResult.value;

			await rateLimit.consume(emailVerificationSession.id, 100);

			const updateResult = await updateEmailUseCase.execute(code, userIdentity, emailVerificationSession);

			if (updateResult.isErr) {
				const { code } = updateResult;

				if (code === "EMAIL_ALREADY_REGISTERED") {
					throw new BadRequestException({
						code: "EMAIL_ALREADY_REGISTERED",
						message: "Email is already in use by another account. Please use a different email address.",
					});
				}
				if (code === "INVALID_VERIFICATION_CODE") {
					throw new BadRequestException({
						code: "INVALID_VERIFICATION_CODE",
						message: "Invalid verification code. Please check the code and try again.",
					});
				}
			}

			const { session, sessionToken } = updateResult.value;

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
