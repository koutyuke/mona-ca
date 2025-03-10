import { t } from "elysia";
import { SessionTokenService } from "../../../../application/services/session-token";
import { ChangeEmailUseCase } from "../../../../application/use-cases/email-verification/change-email.usecase";
import { isErr } from "../../../../common/utils";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { EmailVerificationSessionRepository } from "../../../../interface-adapter/repositories/email-verification-session";
import { UserRepository } from "../../../../interface-adapter/repositories/user";
import { authGuard } from "../../../../modules/auth-guard";
import { ElysiaWithEnv } from "../../../../modules/elysia-with-env";
import { BadRequestException, InternalServerErrorException } from "../../../../modules/error";
import { rateLimiter } from "../../../../modules/rate-limiter";
import { Verification } from "./verification";

const Email = new ElysiaWithEnv({
	prefix: "/email",
})
	// Other Routes
	.use(Verification)

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
	.patch(
		"/",
		async ({
			cfModuleEnv: { DB },
			env: { EMAIL_VERIFICATION_SESSION_PEPPER },
			body: { code, email, emailVerificationSessionToken },
			user,
		}) => {
			const drizzleService = new DrizzleService(DB);

			const emailVerificationSessionRepository = new EmailVerificationSessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const sessionTokenService = new SessionTokenService(EMAIL_VERIFICATION_SESSION_PEPPER);

			const changeEmailUseCase = new ChangeEmailUseCase(
				userRepository,
				emailVerificationSessionRepository,
				sessionTokenService,
			);

			const result = await changeEmailUseCase.execute(emailVerificationSessionToken, email, code, user);

			if (isErr(result)) {
				const { code } = result;

				switch (code) {
					case "INVALID_CODE":
					case "INVALID_EMAIL":
					case "NOT_REQUEST":
					case "CODE_WAS_EXPIRED":
					case "EMAIL_IS_ALREADY_USED":
						throw new BadRequestException({
							name: code,
							message: "Failed to change email.",
						});
					default:
						throw new InternalServerErrorException({
							message: "Unknown ChangeEmailUseCase error result.",
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
				email: t.String({
					format: "email",
				}),
				code: t.String(),
				emailVerificationSessionToken: t.String(),
			}),
		},
	);

export { Email };
