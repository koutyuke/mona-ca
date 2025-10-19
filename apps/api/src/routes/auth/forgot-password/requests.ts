import { t } from "elysia";
import { PasswordResetRequestUseCase } from "../../../features/auth";
import { AuthUserRepository } from "../../../features/auth/adapters/repositories/auth-user/auth-user.repository";
import { PasswordResetSessionRepository } from "../../../features/auth/adapters/repositories/password-reset-session/password-reset-session.repository";
import { CaptchaSchema, captcha } from "../../../plugins/captcha";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../../plugins/elysia-with-env";
import { BadRequestException } from "../../../plugins/error";
import { pathDetail } from "../../../plugins/open-api";
import { RateLimiterSchema, rateLimit } from "../../../plugins/rate-limit";
import { WithClientTypeSchema, withClientType } from "../../../plugins/with-client-type";
import { EmailGateway } from "../../../shared/adapters/gateways/email";
import { verificationEmailTemplate } from "../../../shared/adapters/gateways/email/mail-context";
import { RandomGenerator, SessionSecretHasher } from "../../../shared/infra/crypto";
import { DrizzleService } from "../../../shared/infra/drizzle";
import { CookieManager } from "../../../shared/infra/elysia/cookie";
import { PASSWORD_RESET_SESSION_COOKIE_NAME } from "../../../shared/lib/http";

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
			const authUserRepository = new AuthUserRepository(drizzleService);
			const emailGateway = new EmailGateway(APP_ENV === "production", RESEND_API_KEY);

			const randomGenerator = new RandomGenerator();
			const sessionSecretHasher = new SessionSecretHasher();

			const passwordResetRequestUseCase = new PasswordResetRequestUseCase(
				authUserRepository,
				passwordResetSessionRepository,
				randomGenerator,
				sessionSecretHasher,
			);
			// === End of instances ===

			const result = await passwordResetRequestUseCase.execute(email);

			if (result.isErr) {
				const { code } = result;

				if (code === "USER_NOT_FOUND") {
					throw new BadRequestException({
						code: code,
						message: "User not found with this email address. Please check your email and try again.",
					});
				}

				throw new BadRequestException({
					code: code,
					message: "Password reset request failed. Please try again.",
				});
			}

			const { passwordResetSessionToken, passwordResetSession } = result.value;

			const mailContents = verificationEmailTemplate(passwordResetSession.email, passwordResetSession.code);

			await emailGateway.sendEmail({
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
