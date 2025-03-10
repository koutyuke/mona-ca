import { t } from "elysia";
import { SessionTokenService } from "../../../../../application/services/session-token";
import { EmailVerificationConfirmUseCase } from "../../../../../application/use-cases/email-verification";
import { isErr } from "../../../../../common/utils";
import { DrizzleService } from "../../../../../infrastructure/drizzle";
import { EmailVerificationSessionRepository } from "../../../../../interface-adapter/repositories/email-verification-session";
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
		async ({
			cfModuleEnv: { DB },
			env: { EMAIL_VERIFICATION_SESSION_PEPPER },
			body: { code, emailVerificationSessionToken },
			user,
		}) => {
			const drizzleService = new DrizzleService(DB);

			const emailVerificationSessionRepository = new EmailVerificationSessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const sessionTokenService = new SessionTokenService(EMAIL_VERIFICATION_SESSION_PEPPER);

			const emailVerificationConfirmUseCase = new EmailVerificationConfirmUseCase(
				emailVerificationSessionRepository,
				userRepository,
				sessionTokenService,
			);

			const result = await emailVerificationConfirmUseCase.execute(emailVerificationSessionToken, code, user);

			if (isErr(result)) {
				const { code } = result;

				switch (code) {
					case "INVALID_CODE":
					case "INVALID_EMAIL":
					case "NOT_REQUEST":
					case "CODE_WAS_EXPIRED":
						throw new BadRequestException({
							name: code,
							message: "Failed to confirm user email verification.",
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
				emailVerificationSessionToken: t.String(),
			}),
		},
	);

export { VerificationConfirm };
