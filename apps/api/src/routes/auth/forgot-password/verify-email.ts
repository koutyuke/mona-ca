import { t } from "elysia";
import { SessionSecretService } from "../../../application/services/session";
import {
	PasswordResetVerifyEmailUseCase,
	ValidatePasswordResetSessionUseCase,
} from "../../../application/use-cases/password";
import { PASSWORD_RESET_SESSION_COOKIE_NAME } from "../../../common/constants";
import { FlattenUnion } from "../../../common/schemas";
import { isErr } from "../../../common/utils";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { PasswordResetSessionRepository } from "../../../interface-adapter/repositories/password-reset-session";
import { CookieManager } from "../../../modules/cookie";
import { ElysiaWithEnv, NoContentResponse, NoContentResponseSchema } from "../../../modules/elysia-with-env";
import { BadRequestException, ErrorResponseSchema, InternalServerErrorResponseSchema } from "../../../modules/error";
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
			const passwordResetSessionSecretService = new SessionSecretService(PASSWORD_RESET_SESSION_PEPPER);

			const validatePasswordResetSessionUseCase = new ValidatePasswordResetSessionUseCase(
				passwordResetSessionRepository,
				passwordResetSessionSecretService,
			);
			const passwordResetVerifyEmailUseCase = new PasswordResetVerifyEmailUseCase(passwordResetSessionRepository);
			// === End of instances ===

			const passwordResetSessionToken =
				clientType === "web"
					? cookieManager.getCookie(PASSWORD_RESET_SESSION_COOKIE_NAME)
					: bodyPasswordResetSessionToken;

			if (!passwordResetSessionToken) {
				throw new BadRequestException({
					code: "INVALID_TOKEN",
				});
			}

			const validationResult = await validatePasswordResetSessionUseCase.execute(passwordResetSessionToken);

			if (isErr(validationResult)) {
				const { code } = validationResult;

				if (code === "EXPIRED_CODE") {
					throw new BadRequestException({
						code: "EXPIRED_CODE",
						message: "Password reset session has expired.",
					});
				}

				throw new BadRequestException({
					code: code,
					message: "Invalid token.",
				});
			}

			const { passwordResetSession } = validationResult;

			await rateLimit.consume(passwordResetSession.id, 10);

			const verifyEmailResult = await passwordResetVerifyEmailUseCase.execute(code, passwordResetSession);

			if (isErr(verifyEmailResult)) {
				const { code } = verifyEmailResult;

				if (code === "INVALID_CODE") {
					throw new BadRequestException({
						code: "INVALID_CODE",
						message: "Invalid code.",
					});
				}

				throw new BadRequestException({
					code,
					message: "Failed to verify email.",
				});
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
				400: FlattenUnion(
					WithClientTypeSchema.response[400],
					ErrorResponseSchema("INVALID_TOKEN"),
					ErrorResponseSchema("EXPIRED_TOKEN"),
					ErrorResponseSchema("INVALID_CODE"),
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
