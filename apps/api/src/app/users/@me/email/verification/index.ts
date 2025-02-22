import { t } from "elysia";
import { SendEmailUseCase } from "../../../../../application/use-cases/email";
import { EmailVerificationRequestUseCase } from "../../../../../application/use-cases/email-verification";
import { verificationEmailTemplate } from "../../../../../application/use-cases/email/mail-context";
import { isErr } from "../../../../../common/utils";
import { DrizzleService } from "../../../../../infrastructure/drizzle";
import { EmailVerificationCodeRepository } from "../../../../../interface-adapter/repositories/email-verification-code";
import { UserRepository } from "../../../../../interface-adapter/repositories/user";
import { authGuard } from "../../../../../modules/auth-guard";
import { ElysiaWithEnv } from "../../../../../modules/elysia-with-env";
import {
	BadRequestException,
	InternalServerErrorException,
	TooManyRequestsException,
} from "../../../../../modules/error";
import { rateLimiter } from "../../../../../modules/rate-limiter";
import { VerificationConfirm } from "./confirm";

const Verification = new ElysiaWithEnv({
	prefix: "/verification",
})
	// Other Routes
	.use(VerificationConfirm)

	// Local Middleware & Plugin
	.use(authGuard({ requireEmailVerification: false }))
	.use(
		rateLimiter("email-verification-request", {
			refillRate: 5,
			maxTokens: 5,
			interval: {
				value: 30,
				unit: "m",
			},
		}),
	)

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
			const result = await emailVerificationRequestUseCase.execute(email, user);

			if (isErr(result)) {
				const { code } = result;

				switch (code) {
					case "EMAIL_IS_ALREADY_USED":
					case "EMAIL_IS_ALREADY_VERIFIED":
						throw new BadRequestException({
							name: code,
							message: "Email is already used or verified.",
						});
					default:
						throw new InternalServerErrorException({
							message: "Unknown EmailVerificationRequestUseCase error result.",
						});
				}
			}

			const { code } = result;

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
			beforeHandle: async ({ rateLimiter, user }) => {
				const { success, reset } = await rateLimiter.consume(user.id, 1);

				if (!success) {
					throw new TooManyRequestsException(reset);
				}
				return;
			},
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
