import { t } from "elysia";
import { SessionTokenService } from "../../../application/services/session-token";
import { SendEmailUseCase } from "../../../application/use-cases/email";
import { verificationEmailTemplate } from "../../../application/use-cases/email/mail-context";
import { PasswordResetRequestUseCase } from "../../../application/use-cases/password";
import { PASSWORD_RESET_SESSION_COOKIE_NAME } from "../../../common/constants";
import { FlattenUnion } from "../../../common/schema";
import { isErr } from "../../../common/utils";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { PasswordResetSessionRepository } from "../../../interface-adapter/repositories/password-reset-session";
import { UserRepository } from "../../../interface-adapter/repositories/user";
import { CaptchaSchema, captcha } from "../../../modules/captcha";
import { CookieService } from "../../../modules/cookie";
import { ElysiaWithEnv, NoContentResponse, NoContentResponseSchema } from "../../../modules/elysia-with-env";
import { BadRequestException, ErrorResponseSchema, InternalServerErrorResponseSchema } from "../../../modules/error";
import { pathDetail } from "../../../modules/open-api";
import { RateLimiterSchema, rateLimiter } from "../../../modules/rate-limiter";
import { WithClientTypeSchema, withClientType } from "../../../modules/with-client-type";

const cookieSchemaObject = {
	[PASSWORD_RESET_SESSION_COOKIE_NAME]: t.Optional(t.String()),
};

const PasswordResetRequest = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(withClientType)
	.use(
		rateLimiter("forgot-password-request", {
			maxTokens: 100,
			refillRate: 50,
			refillInterval: {
				value: 30,
				unit: "m",
			},
		}),
	)
	.use(captcha)

	// Route
	.post(
		"",
		async ({
			env: { PASSWORD_RESET_SESSION_PEPPER, RESEND_API_KEY, APP_ENV },
			cfModuleEnv: { DB },
			cookie,
			body: { email },
			clientType,
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieService = new CookieService(APP_ENV === "production", cookie, cookieSchemaObject);
			const passwordResetSessionTokenService = new SessionTokenService(PASSWORD_RESET_SESSION_PEPPER);

			const passwordResetSessionRepository = new PasswordResetSessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const sendEmailUseCase = new SendEmailUseCase(APP_ENV === "production", RESEND_API_KEY);
			const passwordResetRequestUseCase = new PasswordResetRequestUseCase(
				passwordResetSessionRepository,
				userRepository,
				passwordResetSessionTokenService,
			);
			// === End of instances ===

			const result = await passwordResetRequestUseCase.execute(email);

			if (isErr(result)) {
				const { code } = result;

				throw new BadRequestException({
					code,
				});
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

			cookieService.setCookie(PASSWORD_RESET_SESSION_COOKIE_NAME, passwordResetSessionToken, {
				expires: passwordResetSession.expiresAt,
			});

			return NoContentResponse();
		},
		{
			beforeHandle: async ({ rateLimiter, ip, captcha, body: { email, cfTurnstileResponse } }) => {
				await Promise.all([
					rateLimiter.consume(ip, 1),
					rateLimiter.consume(email, 10),
					captcha.verify(cfTurnstileResponse),
				]);
			},
			headers: WithClientTypeSchema.headers,
			cookie: t.Cookie(cookieSchemaObject),
			body: t.Object({
				cfTurnstileResponse: t.String(),
				email: t.String(),
			}),
			response: {
				200: t.Object({
					passwordResetSessionToken: t.String(),
				}),
				204: NoContentResponseSchema,
				400: FlattenUnion(
					WithClientTypeSchema.response[400],
					CaptchaSchema.response[400],
					ErrorResponseSchema("EMAIL_IS_NOT_VERIFIED"),
				),
				429: RateLimiterSchema.response[429],
				500: InternalServerErrorResponseSchema,
			},
			detail: pathDetail({
				tag: "Auth - Forgot Password",
				operationId: "auth-forgot-password-request",
				summary: "Forgot Password Request",
				description: "Password Reset Request endpoint for the User",
			}),
		},
	);

export { PasswordResetRequest };
