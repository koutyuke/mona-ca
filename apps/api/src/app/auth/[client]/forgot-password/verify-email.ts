import { t } from "elysia";
import { SessionTokenService } from "../../../../application/services/session-token";
import { PasswordResetVerifyEmailUseCase } from "../../../../application/use-cases/password";
import { isErr } from "../../../../common/utils";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { PasswordResetSessionRepository } from "../../../../interface-adapter/repositories/password-reset-session";
import { ElysiaWithEnv } from "../../../../modules/elysia-with-env";
import { BadRequestException } from "../../../../modules/error";
import { rateLimiter } from "../../../../modules/rate-limiter";

const VerifyEmail = new ElysiaWithEnv({
	prefix: "/verify-email",
})
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
		"/",
		async ({ env: { SESSION_PEPPER }, cfModuleEnv: { DB }, body: { passwordResetSessionToken, code } }) => {
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

			return null;
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
		},
	);

export { VerifyEmail };
