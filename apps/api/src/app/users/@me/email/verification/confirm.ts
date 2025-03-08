import { t } from "elysia";
import { EmailVerificationConfirmUseCase } from "../../../../../application/use-cases/email-verification";
import { isErr } from "../../../../../common/utils";
import { DrizzleService } from "../../../../../infrastructure/drizzle";
import { EmailVerificationRepository } from "../../../../../interface-adapter/repositories/email-verification";
import { UserRepository } from "../../../../../interface-adapter/repositories/user";
import { authGuard } from "../../../../../modules/auth-guard";
import { ElysiaWithEnv } from "../../../../../modules/elysia-with-env";
import { BadRequestException, InternalServerErrorException } from "../../../../../modules/error";
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
		async ({ cfModuleEnv: { DB }, body: { code }, user }) => {
			const drizzleService = new DrizzleService(DB);

			const emailVerificationCodeRepository = new EmailVerificationRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const emailVerificationConfirmUseCase = new EmailVerificationConfirmUseCase(
				emailVerificationCodeRepository,
				userRepository,
			);

			const result = await emailVerificationConfirmUseCase.execute(code, user);

			if (isErr(result)) {
				const { code } = result;

				switch (code) {
					case "INVALID_CODE":
						throw new BadRequestException({
							name: code,
							message: "Invalid verification code",
						});
					default:
						throw new InternalServerErrorException({
							message: "Unknown EmailVerificationConfirmUseCase error result.",
						});
				}
			}

			return null;
		},
		{
			beforeHandle: async ({ rateLimiter, user }) => {
				await rateLimiter.consume(user.id, 1);
			},
			body: t.Object({
				code: t.String(),
			}),
		},
	);

export { VerificationConfirm };
