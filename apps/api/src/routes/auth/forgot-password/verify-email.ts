import { t } from "elysia";
import { SessionTokenService } from "../../../application/services/session-token";
import { PasswordResetVerifyEmailUseCase } from "../../../application/use-cases/password";
import { PASSWORD_RESET_SESSION_COOKIE_NAME } from "../../../common/constants";
import { FlattenUnion } from "../../../common/schema";
import { isErr } from "../../../common/utils";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { PasswordResetSessionRepository } from "../../../interface-adapter/repositories/password-reset-session";
import { CookieManager } from "../../../modules/cookie";
import { ElysiaWithEnv, NoContentResponse, NoContentResponseSchema } from "../../../modules/elysia-with-env";
import { BadRequestException, ErrorResponseSchema, InternalServerErrorResponseSchema } from "../../../modules/error";
import { pathDetail } from "../../../modules/open-api";
import { RateLimiterSchema, rateLimiter } from "../../../modules/rate-limiter";
import { WithClientTypeSchema, withClientType } from "../../../modules/with-client-type";

export const PasswordResetVerifyEmail = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(withClientType)
	.use(
		rateLimiter("forgot-password-verify-email", {
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
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const passwordResetSessionRepository = new PasswordResetSessionRepository(drizzleService);
			const passwordResetSessionTokenService = new SessionTokenService(PASSWORD_RESET_SESSION_PEPPER);

			const passwordResetVerifyEmailUseCase = new PasswordResetVerifyEmailUseCase(
				passwordResetSessionRepository,
				passwordResetSessionTokenService,
			);
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

			const result = await passwordResetVerifyEmailUseCase.execute(passwordResetSessionToken, code);

			if (isErr(result)) {
				const { code } = result;

				throw new BadRequestException({
					code,
				});
			}

			return NoContentResponse();
		},
		{
			beforeHandle: async ({
				rateLimiter,
				ip,
				env: { PASSWORD_RESET_SESSION_PEPPER },
				cookie,
				body: { passwordResetSessionToken: token },
				clientType,
			}) => {
				const passwordResetSessionToken =
					clientType === "web" ? cookie[PASSWORD_RESET_SESSION_COOKIE_NAME].value : token;

				if (!passwordResetSessionToken) {
					throw new BadRequestException({
						code: "INVALID_TOKEN",
					});
				}

				const sessionTokenService = new SessionTokenService(PASSWORD_RESET_SESSION_PEPPER);
				const sessionId = sessionTokenService.hashSessionToken(passwordResetSessionToken);

				await Promise.all([rateLimiter.consume(ip, 1), rateLimiter.consume(sessionId, 10)]);
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
					ErrorResponseSchema("TOKEN_EXPIRED"),
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
