import { Elysia, t } from "elysia";
import { CaptchaSchema, captcha } from "../../../plugins/captcha";
import { di } from "../../../plugins/di";
import { pathDetail } from "../../../plugins/open-api";
import { RateLimiterSchema, rateLimit } from "../../../plugins/rate-limit";
import { WithClientTypeSchema, withClientType } from "../../../plugins/with-client-type";
import { env } from "../../../shared/infra/config/env";
import {
	BadRequestException,
	CookieManager,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../../shared/infra/elysia";
import { SIGNUP_SESSION_COOKIE_NAME } from "../../../shared/lib/http";

export const SignupRequest = new Elysia()

	// Local Middleware & Plugin
	.use(di())
	.use(withClientType)
	.use(
		rateLimit("signup-request", {
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
		async ({ containers, cookie, body: { email }, clientType }) => {
			const cookieManager = new CookieManager(env.APP_ENV === "production", cookie);

			const result = await containers.auth.signupRequestUseCase.execute(email);

			if (result.isErr) {
				const { code } = result;

				if (code === "EMAIL_ALREADY_USED") {
					throw new BadRequestException({
						code: code,
						message: "Email is already used. Please use a different email address or try logging in.",
					});
				}

				throw new BadRequestException({
					code: code,
					message: "Signup request failed. Please try again.",
				});
			}

			const { signupSessionToken, signupSession } = result.value;

			if (clientType === "mobile") {
				return {
					signupSessionToken,
				};
			}

			cookieManager.setCookie(SIGNUP_SESSION_COOKIE_NAME, signupSessionToken, {
				expires: signupSession.expiresAt,
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
				[SIGNUP_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				cfTurnstileResponse: t.String(),
				email: t.String(),
			}),
			response: withBaseResponseSchema({
				200: t.Object({
					signupSessionToken: t.String(),
				}),
				204: NoContentResponseSchema,
				400: ResponseTUnion(
					WithClientTypeSchema.response[400],
					CaptchaSchema.response[400],
					ErrorResponseSchema("EMAIL_ALREADY_USED"),
				),
				429: RateLimiterSchema.response[429],
			}),
			detail: pathDetail({
				tag: "Auth",
				operationId: "auth-signup-request",
				summary: "Signup Request",
				description: "Signup Request endpoint for the User",
			}),
		},
	);
