import { EmailUseCase } from "@/application/use-cases/email";
import { EmailVerificationUseCase } from "@/application/use-cases/email-verification/email-verification.usecase";
import { UserUseCase } from "@/application/use-cases/user";
import { DrizzleService } from "@/infrastructure/drizzle";
import { EmailVerificationCodeRepository } from "@/interface-adapter/repositories/email-verification-code";
import { UserRepository } from "@/interface-adapter/repositories/user";
import { authGuard } from "@/modules/auth-guard";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { BadRequestException } from "@/modules/error/exceptions";
import { t } from "elysia";
import { VerificationConfirm } from "./confirm";

const Verification = new ElysiaWithEnv({
	prefix: "/verification",
})
	// Other Routes
	.use(VerificationConfirm)

	// Local Middleware & Plugin
	.use(authGuard({ emailVerificationRequired: false }))

	// Route
	.post(
		"/",
		async ({ cfModuleEnv: { DB }, env: { APP_ENV, RESEND_API_KEY }, body: { email: bodyEmail }, user }) => {
			const drizzleService = new DrizzleService(DB);

			const emailVerificationUseCase = new EmailVerificationUseCase(
				new EmailVerificationCodeRepository(drizzleService),
			);
			const emailUseCase = new EmailUseCase(RESEND_API_KEY, APP_ENV === "production");
			const userUseCase = new UserUseCase(new UserRepository(drizzleService));

			const email = bodyEmail || user.email;
			const sameEmailUser = await userUseCase.getUserByEmail(email);

			if ((email === user.email && user.emailVerified) || (sameEmailUser && sameEmailUser.id !== user.id)) {
				throw new BadRequestException();
			}

			const code = await emailVerificationUseCase.createVerificationCode(email, user.id);
			const codeMailContents = emailVerificationUseCase.generateVerificationEmailContents(code);
			await emailUseCase.sendEmail({
				from: codeMailContents.from,
				to: codeMailContents.to,
				subject: codeMailContents.subject,
				text: codeMailContents.text,
			});
			return null;
		},
		{
			body: t.Object({
				email: t.Optional(
					t.String({
						format: "email",
					}),
				),
			}),
		},
	);

export { Verification };
