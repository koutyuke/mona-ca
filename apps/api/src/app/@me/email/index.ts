import { EmailVerificationUseCase } from "@/application/use-cases/email-verification/email-verification.usecase";
import { UserUseCase } from "@/application/use-cases/user";
import { DrizzleService } from "@/infrastructure/drizzle";
import { EmailVerificationCodeRepository } from "@/interface-adapter/repositories/email-verification-code";
import { UserRepository } from "@/interface-adapter/repositories/user";
import { authGuard } from "@/modules/auth-guard";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { BadRequestException } from "@/modules/error/exceptions";
import { t } from "elysia";
import { Verification } from "./verification";

const Email = new ElysiaWithEnv({
	prefix: "/email",
})
	// Other Routes
	.use(Verification)

	// Local Middleware & Plugin
	.use(authGuard({ emailVerificationRequired: false }))

	// Route
	.patch(
		"/",
		async ({ cfModuleEnv: { DB }, body: { code, email }, user }) => {
			const drizzleService = new DrizzleService(DB);

			const emailVerificationUseCase = new EmailVerificationUseCase(
				new EmailVerificationCodeRepository(drizzleService),
			);
			const userUseCase = new UserUseCase(new UserRepository(drizzleService));

			const validCode = await emailVerificationUseCase.validateVerificationCode(code, email, user.id);
			const sameEmailUser = await userUseCase.getUserByEmail(email);

			if (!validCode || (sameEmailUser && sameEmailUser.id !== user.id)) {
				throw new BadRequestException();
			}

			await userUseCase.updateUser(user.id, {
				email,
				emailVerified: true,
			});
		},
		{
			body: t.Object({
				email: t.String({
					format: "email",
				}),
				code: t.String(),
			}),
		},
	);

export { Email };
