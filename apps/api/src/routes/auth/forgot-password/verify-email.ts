import { t } from "elysia";
import { newPasswordResetSessionToken } from "../../../common/domain/value-objects";
import { CookieManager } from "../../../features/auth/adapters/http/cookie";
import { PasswordResetSessionRepository } from "../../../features/auth/adapters/repositories/password-reset-session";
import {
	PasswordResetVerifyEmailUseCase,
	ValidatePasswordResetSessionUseCase,
} from "../../../features/auth/application/use-cases/password";
import { UserRepository } from "../../../features/user/adapters/repositories/user";
import { SessionSecretHasher } from "../../../infrastructure/crypto";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { PASSWORD_RESET_SESSION_COOKIE_NAME } from "../../../lib/constants";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../../plugins/elysia-with-env";
import { BadRequestException, UnauthorizedException } from "../../../plugins/error";
import { pathDetail } from "../../../plugins/open-api";
import { RateLimiterSchema, rateLimit } from "../../../plugins/rate-limit";
import { WithClientTypeSchema, withClientType } from "../../../plugins/with-client-type";

export const PasswordResetVerifyEmail = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(withClientType)
	.use(
		rateLimit("forgot-password-verify-email", {
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
		"/verify-email",
		async ({
			env: { APP_ENV },
			cfModuleEnv: { DB },
			cookie,
			body: { passwordResetSessionToken: bodyPasswordResetSessionToken, code },
			clientType,
			rateLimit,
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const passwordResetSessionRepository = new PasswordResetSessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const sessionSecretHasher = new SessionSecretHasher();

			const validatePasswordResetSessionUseCase = new ValidatePasswordResetSessionUseCase(
				passwordResetSessionRepository,
				userRepository,
				sessionSecretHasher,
			);
			const passwordResetVerifyEmailUseCase = new PasswordResetVerifyEmailUseCase(passwordResetSessionRepository);
			// === End of instances ===

			const rawPasswordResetSessionToken =
				clientType === "web"
					? cookieManager.getCookie(PASSWORD_RESET_SESSION_COOKIE_NAME)
					: bodyPasswordResetSessionToken;

			if (!rawPasswordResetSessionToken) {
				throw new UnauthorizedException({
					code: "PASSWORD_RESET_SESSION_INVALID",
					message: "Password reset session token not found. Please request password reset again.",
				});
			}

			const validationResult = await validatePasswordResetSessionUseCase.execute(
				newPasswordResetSessionToken(rawPasswordResetSessionToken),
			);

			if (validationResult.isErr) {
				const { code } = validationResult;

				if (code === "PASSWORD_RESET_SESSION_INVALID") {
					throw new UnauthorizedException({
						code: code,
						message: "Invalid password reset session. Please request password reset again.",
					});
				}
				if (code === "PASSWORD_RESET_SESSION_EXPIRED") {
					throw new UnauthorizedException({
						code: code,
						message: "Password reset session has expired. Please request password reset again.",
					});
				}
			}

			const { passwordResetSession } = validationResult.value;

			await rateLimit.consume(passwordResetSession.id, 100);

			const verifyEmailResult = await passwordResetVerifyEmailUseCase.execute(code, passwordResetSession);

			if (verifyEmailResult.isErr) {
				const { code } = verifyEmailResult;

				if (code === "INVALID_VERIFICATION_CODE") {
					throw new BadRequestException({
						code: code,
						message: "Invalid verification code. Please check your email and try again.",
					});
				}
			}

			return NoContentResponse();
		},
		{
			beforeHandle: async ({ rateLimit, ip }) => {
				await rateLimit.consume(ip, 1);
			},
			headers: WithClientTypeSchema.headers,
			cookie: t.Cookie({
				[PASSWORD_RESET_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				code: t.String(),
				passwordResetSessionToken: t.Optional(t.String()),
			}),
			response: withBaseResponseSchema({
				204: NoContentResponseSchema,
				400: ResponseTUnion(WithClientTypeSchema.response[400], ErrorResponseSchema("INVALID_CODE")),
				401: ResponseTUnion(
					ErrorResponseSchema("PASSWORD_RESET_SESSION_INVALID"),
					ErrorResponseSchema("PASSWORD_RESET_SESSION_EXPIRED"),
				),
				429: RateLimiterSchema.response[429],
			}),
			detail: pathDetail({
				tag: "Auth - Forgot Password",
				operationId: "auth-forgot-password-verify-email",
				summary: "Password Reset Verify Email",
				description: "Password Reset Verify Email endpoint for the User",
			}),
		},
	);
