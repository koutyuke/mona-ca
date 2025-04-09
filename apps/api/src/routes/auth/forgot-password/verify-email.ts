import { t } from "elysia";
import { SessionTokenService } from "../../../application/services/session-token";
import { PasswordResetVerifyEmailUseCase } from "../../../application/use-cases/password";
import { FlattenUnion } from "../../../common/schema";
import { isErr } from "../../../common/utils";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { PasswordResetSessionRepository } from "../../../interface-adapter/repositories/password-reset-session";
import { ElysiaWithEnv } from "../../../modules/elysia-with-env";
import { BadRequestException, ErrorResponseSchema, InternalServerErrorResponseSchema } from "../../../modules/error";
import { pathDetail } from "../../../modules/open-api";
import { RateLimiterSchema, rateLimiter } from "../../../modules/rate-limiter";

export const PasswordResetVerifyEmail = new ElysiaWithEnv()
	// Local Middleware & Plugin
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
		async ({ env: { SESSION_PEPPER }, cfModuleEnv: { DB }, body: { passwordResetSessionToken, code }, set }) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);

			const passwordResetSessionRepository = new PasswordResetSessionRepository(drizzleService);
			const sessionTokenService = new SessionTokenService(SESSION_PEPPER);

			const passwordResetVerifyEmailUseCase = new PasswordResetVerifyEmailUseCase(
				passwordResetSessionRepository,
				sessionTokenService,
			);
			// === End of instances ===

			const result = await passwordResetVerifyEmailUseCase.execute(passwordResetSessionToken, code);

			if (isErr(result)) {
				const { code } = result;

				throw new BadRequestException({
					code,
				});
			}

			set.status = 204;
			return;
		},
		{
			beforeHandle: async ({
				rateLimiter,
				ip,
				env: { SESSION_PEPPER },
				body: { passwordResetSessionToken: token },
			}) => {
				const sessionTokenService = new SessionTokenService(SESSION_PEPPER);
				const sessionId = sessionTokenService.hashSessionToken(token);

				await Promise.all([rateLimiter.consume(ip, 1), rateLimiter.consume(sessionId, 10)]);
			},
			body: t.Object({
				passwordResetSessionToken: t.String(),
				code: t.String(),
			}),
			response: {
				204: t.Void(),
				400: FlattenUnion(
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
