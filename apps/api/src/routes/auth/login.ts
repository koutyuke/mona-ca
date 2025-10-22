import { Elysia, t } from "elysia";
import { env } from "../../core/infra/config/env";
import {
	BadRequestException,
	CookieManager,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../core/infra/elysia";
import { SESSION_COOKIE_NAME } from "../../core/lib/http";
import { CaptchaSchema, captcha } from "../../plugins/captcha";
import { di } from "../../plugins/di";
import { pathDetail } from "../../plugins/open-api";
import { RateLimiterSchema, rateLimit } from "../../plugins/rate-limit";
import { WithClientTypeSchema, withClientType } from "../../plugins/with-client-type";

export const Login = new Elysia()
	// Local Middleware & Plugin
	.use(di())
	.use(withClientType)
	.use(
		rateLimit("login", {
			maxTokens: 1000,
			refillRate: 500,
			refillInterval: {
				value: 30,
				unit: "m",
			},
		}),
	)
	.use(captcha)

	// Route
	.post(
		"/login",
		async ({ clientType, cookie, body: { email, password }, containers }) => {
			const cookieManager = new CookieManager(env.APP_ENV === "production", cookie);

			const result = await containers.auth.loginUseCase.execute(email, password);

			if (result.isErr) {
				const { code } = result;

				if (code === "INVALID_CREDENTIALS") {
					throw new BadRequestException({
						code: "INVALID_CREDENTIALS",
						message: "Invalid email or password. Please check your credentials and try again.",
					});
				}
				throw new BadRequestException({
					code: code,
					message: "Login failed. Please try again.",
				});
			}
			const { session, sessionToken } = result.value;

			if (clientType === "mobile") {
				return {
					sessionToken,
				};
			}

			cookieManager.setCookie(SESSION_COOKIE_NAME, sessionToken, {
				expires: session.expiresAt,
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
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				cfTurnstileResponse: t.String(),
				email: t.String({
					format: "email",
				}),
				password: t.String(),
			}),
			response: withBaseResponseSchema({
				200: t.Object({
					sessionToken: t.String(),
				}),
				204: NoContentResponseSchema,
				400: ResponseTUnion(
					WithClientTypeSchema.response[400],
					CaptchaSchema.response[400],
					ErrorResponseSchema("INVALID_CREDENTIALS"),
				),
				429: RateLimiterSchema.response[429],
			}),
			detail: pathDetail({
				operationId: "auth-login",
				summary: "Login",
				description: "Login to the application",
				tag: "Auth",
			}),
		},
	);
