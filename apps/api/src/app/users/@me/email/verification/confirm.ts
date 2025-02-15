import { t } from "elysia";
import { EmailVerificationConfirmUseCase } from "../../../../../application/use-cases/email-verification";
import { DrizzleService } from "../../../../../infrastructure/drizzle";
import { EmailVerificationCodeRepository } from "../../../../../interface-adapter/repositories/email-verification-code";
import { UserRepository } from "../../../../../interface-adapter/repositories/user";
import { authGuard } from "../../../../../modules/auth-guard";
import { ElysiaWithEnv } from "../../../../../modules/elysia-with-env";
import { TooManyRequestsException } from "../../../../../modules/error";
import { rateLimiter } from "../../../../../modules/rate-limiter";

const VerificationConfirm = new ElysiaWithEnv({
	prefix: "/confirm",
})
	// Local Middleware & Plugin
	.use(authGuard({ requireEmailVerification: false }))
	.use(
		rateLimiter("email-verification-request", {
			refillRate: 10,
			maxTokens: 10,
			interval: {
				value: 30,
				unit: "m",
			},
		}),
	)

	// Route
	.post(
		"/",
		async ({ cfModuleEnv: { DB }, body: { code }, user, set }) => {
			const drizzleService = new DrizzleService(DB);

			const emailVerificationCodeRepository = new EmailVerificationCodeRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const emailVerificationConfirmUseCase = new EmailVerificationConfirmUseCase(
				emailVerificationCodeRepository,
				userRepository,
			);

			const { success } = await emailVerificationConfirmUseCase.execute(code, user);

			if (!success) {
				set.status = 400;
				return {
					error: "Invalid verification code",
				};
			}
			return null;
		},
		{
			beforeHandle: async ({ rateLimiter, user }) => {
				const { success, reset } = await rateLimiter.consume(user.id, 1);

				if (!success) {
					throw new TooManyRequestsException(reset);
				}
				return;
			},
			body: t.Object({
				code: t.String(),
			}),
		},
	);

export { VerificationConfirm };
