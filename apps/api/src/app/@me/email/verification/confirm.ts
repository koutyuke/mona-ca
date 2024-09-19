import { EmailVerificationUseCase } from "@/application/use-cases/emial-verification/email-verification.usecase";
import { UserUseCase } from "@/application/use-cases/user";
import { EmailVerificationCodeRepository } from "@/interface-adapter/repositories/email-verification-code";
import { UserRepository } from "@/interface-adapter/repositories/user";
import { authGuard } from "@/modules/auth-guard";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { BadRequestException } from "@/modules/error/exceptions";
import { t } from "elysia";

const VerificationConfirm = new ElysiaWithEnv({
	prefix: "/confirm",
})
	// Local Middleware & Plugin
	.use(authGuard)

	// Route
	.post(
		"/",
		async ({ cfModuleEnv: { DB }, body: { code }, user }) => {
			const emailVerificationUseCase = new EmailVerificationUseCase(
				new EmailVerificationCodeRepository({
					db: DB,
				}),
			);

			const userUseCase = new UserUseCase(
				new UserRepository({
					db: DB,
				}),
			);

			const validCode = await emailVerificationUseCase.validateVerificationCode(code, user.email, user.id);

			if (!validCode) {
				throw new BadRequestException();
			}

			await userUseCase.updateUser(user.id, {
				emailVerified: true,
			});
		},
		{
			body: t.Object({
				code: t.String(),
			}),
		},
	);

export { VerificationConfirm };
