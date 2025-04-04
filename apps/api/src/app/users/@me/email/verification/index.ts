import { t } from "elysia";
import { SessionTokenService } from "../../../../../application/services/session-token";
import { SendEmailUseCase } from "../../../../../application/use-cases/email";
import { EmailVerificationRequestUseCase } from "../../../../../application/use-cases/email-verification";
import { verificationEmailTemplate } from "../../../../../application/use-cases/email/mail-context";
import { isErr } from "../../../../../common/utils";
import { DrizzleService } from "../../../../../infrastructure/drizzle";
import { EmailVerificationSessionRepository } from "../../../../../interface-adapter/repositories/email-verification-session";
import { UserRepository } from "../../../../../interface-adapter/repositories/user";
import { authGuard } from "../../../../../modules/auth-guard";
import { ElysiaWithEnv } from "../../../../../modules/elysia-with-env";
import { BadRequestException, InternalServerErrorException } from "../../../../../modules/error";
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
			maxTokens: 5,
			refillRate: 5,
			refillInterval: {
				value: 30,
				unit: "m",
			},
		}),
	)

	// Route
	.post(
		"/",
		async ({
			cfModuleEnv: { DB },
			env: { APP_ENV, RESEND_API_KEY, EMAIL_VERIFICATION_SESSION_PEPPER },
			body: { email: bodyEmail },
			user,
		}) => {
			const drizzleService = new DrizzleService(DB);

			const emailVerificationSessionRepository = new EmailVerificationSessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const sessionTokenService = new SessionTokenService(EMAIL_VERIFICATION_SESSION_PEPPER);

			const sendEmailUseCase = new SendEmailUseCase(APP_ENV === "production", RESEND_API_KEY);
			const emailVerificationRequestUseCase = new EmailVerificationRequestUseCase(
				emailVerificationSessionRepository,
				userRepository,
				sessionTokenService,
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

			const { emailVerificationSession, emailVerificationSessionToken } = result;

			const mailContents = verificationEmailTemplate(emailVerificationSession.email, emailVerificationSession.code);

			await sendEmailUseCase.execute({
				from: mailContents.from,
				to: mailContents.to,
				subject: mailContents.subject,
				text: mailContents.text,
			});

			return {
				emailVerificationSessionToken,
			};
		},
		{
			beforeHandle: async ({ rateLimiter, user }) => {
				await rateLimiter.consume(user.id, 1);
			},
			body: t.Object({
				email: t.Optional(
					t.String({
						format: "email",
					}),
				),
			}),
			response: {
				200: t.Object({
					emailVerificationSessionToken: t.String(),
				}),
			},
		},
	);

export { Verification };
