import { t } from "elysia";
import { EmailVerificationConfirmUseCase } from "../../../../application/use-cases/email-verification";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { EmailVerificationCodeRepository } from "../../../../interface-adapter/repositories/email-verification-code";
import { UserRepository } from "../../../../interface-adapter/repositories/user";
import { authGuard } from "../../../../modules/auth-guard";
import { ElysiaWithEnv } from "../../../../modules/elysia-with-env";

const VerificationConfirm = new ElysiaWithEnv({
	prefix: "/confirm",
})
	// Local Middleware & Plugin
	.use(authGuard({ requireEmailVerification: false }))

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
			body: t.Object({
				code: t.String(),
			}),
		},
	);

export { VerificationConfirm };
