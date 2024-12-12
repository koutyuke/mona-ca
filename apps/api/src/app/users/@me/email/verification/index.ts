import { t } from "elysia";
import { SendEmailUseCase } from "../../../../../application/use-cases/email";
import { EmailVerificationRequestUseCase } from "../../../../../application/use-cases/email-verification";
import { verificationEmailTemplate } from "../../../../../application/use-cases/email/templates";
import { DrizzleService } from "../../../../../infrastructure/drizzle";
import { EmailVerificationCodeRepository } from "../../../../../interface-adapter/repositories/email-verification-code";
import { UserRepository } from "../../../../../interface-adapter/repositories/user";
import { authGuard } from "../../../../../modules/auth-guard";
import { ElysiaWithEnv } from "../../../../../modules/elysia-with-env";
import { VerificationConfirm } from "./confirm";

const Verification = new ElysiaWithEnv({
	prefix: "/verification",
})
	// Other Routes
	.use(VerificationConfirm)

	// Local Middleware & Plugin
	.use(authGuard({ requireEmailVerification: false }))

	// Route
	.post(
		"/",
		async ({ cfModuleEnv: { DB }, env: { APP_ENV, RESEND_API_KEY }, body: { email: bodyEmail }, user }) => {
			const drizzleService = new DrizzleService(DB);

			const emailVerificationCodeRepository = new EmailVerificationCodeRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const sendEmailUseCase = new SendEmailUseCase(RESEND_API_KEY, APP_ENV === "production");
			const emailVerificationRequestUseCase = new EmailVerificationRequestUseCase(
				emailVerificationCodeRepository,
				userRepository,
			);

			const email = bodyEmail || user.email;
			const { code } = await emailVerificationRequestUseCase.execute(email, user);

			if (!code) {
				return null;
			}

			const mailContents = verificationEmailTemplate(code);

			await sendEmailUseCase.execute({
				from: mailContents.from,
				to: mailContents.to,
				subject: mailContents.subject,
				text: mailContents.text,
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
