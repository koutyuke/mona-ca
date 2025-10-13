import { t } from "elysia";
import { SendEmailUseCase } from "../../../application/use-cases/email";
import { verificationEmailTemplate } from "../../../application/use-cases/email/mail-context";
import { PasswordResetRequestUseCase } from "../../../application/use-cases/password";
import { PASSWORD_RESET_SESSION_COOKIE_NAME } from "../../../common/constants";
import { isErr } from "../../../common/utils";
import { RandomGenerator, SessionSecretHasher } from "../../../infrastructure/crypt";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { PasswordResetSessionRepository } from "../../../interface-adapter/repositories/password-reset-session";
import { UserRepository } from "../../../interface-adapter/repositories/user";
import { CaptchaSchema, captcha } from "../../../modules/captcha";
import { CookieManager } from "../../../modules/cookie";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../../modules/elysia-with-env";
import { BadRequestException } from "../../../modules/error";
import { pathDetail } from "../../../modules/open-api";
import { RateLimiterSchema, rateLimit } from "../../../modules/rate-limit";
import { WithClientTypeSchema, withClientType } from "../../../modules/with-client-type";

const PasswordResetRequest = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(withClientType)
	.use(
		rateLimit("forgot-password-request", {
			maxTokens: 1000,
			refillRate: 500,
			refillInterval: {
				value: 10,
				unit: "m",
			},
		}),
	)
	.use(captcha)

	// Route
	.post(
		"",
		async ({ env: { RESEND_API_KEY, APP_ENV }, cfModuleEnv: { DB }, cookie, body: { email }, clientType }) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const passwordResetSessionRepository = new PasswordResetSessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const randomGenerator = new RandomGenerator();
			const sessionSecretHasher = new SessionSecretHasher();

			const sendEmailUseCase = new SendEmailUseCase(APP_ENV === "production", RESEND_API_KEY);
			const passwordResetRequestUseCase = new PasswordResetRequestUseCase(
				passwordResetSessionRepository,
				userRepository,
				randomGenerator,
				sessionSecretHasher,
			);
			// === End of instances ===

			const result = await passwordResetRequestUseCase.execute(email);

			if (isErr(result)) {
				const { code } = result;

				switch (code) {
					case "USER_NOT_FOUND":
						throw new BadRequestException({
							code: code,
							message: "User not found with this email address. Please check your email and try again.",
						});
					default:
						throw new BadRequestException({
							code: code,
							message: "Password reset request failed. Please try again.",
						});
				}
			}

			const { passwordResetSessionToken, passwordResetSession } = result;

			const mailContents = verificationEmailTemplate(passwordResetSession.email, passwordResetSession.code);

			await sendEmailUseCase.execute({
				from: mailContents.from,
				to: mailContents.to,
				subject: mailContents.subject,
				text: mailContents.text,
			});

			if (clientType === "mobile") {
				return {
					passwordResetSessionToken,
				};
			}

			cookieManager.setCookie(PASSWORD_RESET_SESSION_COOKIE_NAME, passwordResetSessionToken, {
				expires: passwordResetSession.expiresAt,
			});

			return NoContentResponse();
		},
		{
			beforeHandle: async ({ rateLimit, ip, captcha, body: { email, cfTurnstileResponse } }) => {
				await captcha.verify(cfTurnstileResponse);
				await Promise.all([rateLimit.consume(ip, 1), rateLimit.consume(email, 100)]);
			},
			headers: WithClientTypeSchema.headers,
			cookie: t.Cookie({
				[PASSWORD_RESET_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				cfTurnstileResponse: t.String(),
				email: t.String(),
			}),
			response: withBaseResponseSchema({
				200: t.Object({
					passwordResetSessionToken: t.String(),
				}),
				204: NoContentResponseSchema,
				400: ResponseTUnion(
					WithClientTypeSchema.response[400],
					CaptchaSchema.response[400],
					ErrorResponseSchema("USER_NOT_FOUND"),
				),
				429: RateLimiterSchema.response[429],
			}),
			detail: pathDetail({
				tag: "Auth - Forgot Password",
				operationId: "auth-forgot-password-request",
				summary: "Forgot Password Request",
				description: "Password Reset Request endpoint for the User",
			}),
		},
	);

export { PasswordResetRequest };
