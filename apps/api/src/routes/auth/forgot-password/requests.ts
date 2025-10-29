import Elysia, { t } from "elysia";
import { env } from "../../../core/infra/config/env";
import {
	BadRequestException,
	CookieManager,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../../core/infra/elysia";
import { PASSWORD_RESET_SESSION_COOKIE_NAME } from "../../../core/lib/http";
import { CaptchaSchema, captcha } from "../../../plugins/captcha";
import { di } from "../../../plugins/di";
import { pathDetail } from "../../../plugins/openapi";
import { RateLimiterSchema, rateLimit } from "../../../plugins/rate-limit";
import { WithClientTypeSchema, withClientType } from "../../../plugins/with-client-type";

const PasswordResetRequest = new Elysia()
	// Local Middleware & Plugin
	.use(di())
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
		async ({ cookie, body: { email }, clientType, containers }) => {
			const cookieManager = new CookieManager(env.APP_ENV === "production", cookie);

			const result = await containers.auth.passwordResetRequestUseCase.execute(email);

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
