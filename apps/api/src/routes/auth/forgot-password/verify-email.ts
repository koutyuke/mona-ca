import { t } from "elysia";
import { SessionSecretService } from "../../../application/services/session";
import {
	PasswordResetVerifyEmailUseCase,
	ValidatePasswordResetSessionUseCase,
} from "../../../application/use-cases/password";
import { PASSWORD_RESET_SESSION_COOKIE_NAME } from "../../../common/constants";

import { isErr } from "../../../common/utils";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { PasswordResetSessionRepository } from "../../../interface-adapter/repositories/password-reset-session";
import { UserRepository } from "../../../interface-adapter/repositories/user";
import { CookieManager } from "../../../modules/cookie";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	InternalServerErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
} from "../../../modules/elysia-with-env";
import { BadRequestException, UnauthorizedException } from "../../../modules/error";
import { pathDetail } from "../../../modules/open-api";
import { RateLimiterSchema, rateLimit } from "../../../modules/rate-limit";
import { WithClientTypeSchema, withClientType } from "../../../modules/with-client-type";

export const PasswordResetVerifyEmail = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(withClientType)
	.use(
		rateLimit("forgot-password-verify-email", {
			maxTokens: 100,
			refillRate: 50,
			refillInterval: {
				value: 30,
				unit: "m",
			},
		}),
	)

	// Route
	.post(
		"/verify-email",
		async ({
			env: { APP_ENV, PASSWORD_RESET_SESSION_PEPPER },
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
			const passwordResetSessionSecretService = new SessionSecretService(PASSWORD_RESET_SESSION_PEPPER);

			const validatePasswordResetSessionUseCase = new ValidatePasswordResetSessionUseCase(
				passwordResetSessionRepository,
				passwordResetSessionSecretService,
				userRepository,
			);
			const passwordResetVerifyEmailUseCase = new PasswordResetVerifyEmailUseCase(passwordResetSessionRepository);
			// === End of instances ===

			const passwordResetSessionToken =
				clientType === "web"
					? cookieManager.getCookie(PASSWORD_RESET_SESSION_COOKIE_NAME)
					: bodyPasswordResetSessionToken;

			if (!passwordResetSessionToken) {
				throw new UnauthorizedException({
					code: "PASSWORD_RESET_SESSION_INVALID",
					message: "Password reset session token not found. Please request password reset again.",
				});
			}

			const validationResult = await validatePasswordResetSessionUseCase.execute(passwordResetSessionToken);

			if (isErr(validationResult)) {
				const { code } = validationResult;

				switch (code) {
					case "PASSWORD_RESET_SESSION_INVALID":
						throw new UnauthorizedException({
							code: code,
							message: "Invalid password reset session. Please request password reset again.",
						});
					case "PASSWORD_RESET_SESSION_EXPIRED":
						throw new UnauthorizedException({
							code: code,
							message: "Password reset session has expired. Please request password reset again.",
						});
					default:
						throw new BadRequestException({
							code: code,
							message: "Password reset session validation failed. Please try again.",
						});
				}
			}

			const { passwordResetSession } = validationResult;

			await rateLimit.consume(passwordResetSession.id, 10);

			const verifyEmailResult = await passwordResetVerifyEmailUseCase.execute(code, passwordResetSession);

			if (isErr(verifyEmailResult)) {
				const { code } = verifyEmailResult;

				switch (code) {
					case "INVALID_VERIFICATION_CODE":
						throw new BadRequestException({
							code: code,
							message: "Invalid verification code. Please check your email and try again.",
						});
					default:
						throw new BadRequestException({
							code: code,
							message: "Email verification failed. Please try again.",
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
			response: {
				204: NoContentResponseSchema,
				400: ResponseTUnion(WithClientTypeSchema.response[400], ErrorResponseSchema("INVALID_CODE")),
				401: ResponseTUnion(
					ErrorResponseSchema("PASSWORD_RESET_SESSION_INVALID"),
					ErrorResponseSchema("PASSWORD_RESET_SESSION_EXPIRED"),
				),
				429: RateLimiterSchema.response[429],
				500: InternalServerErrorResponseSchema,
			},
			detail: pathDetail({
				tag: "Auth - Forgot Password",
				operationId: "auth-forgot-password-verify-email",
				summary: "Password Reset Verify Email",
				description: "Password Reset Verify Email endpoint for the User",
			}),
		},
	);
