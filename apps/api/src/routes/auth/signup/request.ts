import { Elysia, t } from "elysia";
import { defaultCookieOptions } from "../../../core/infra/elysia";
import { SIGNUP_SESSION_COOKIE_NAME } from "../../../core/lib/http";
import { toAnySessionTokenResponse } from "../../../features/auth";
import { captchaPlugin } from "../../../plugins/captcha";
import { clientTypePlugin } from "../../../plugins/client-type";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";
import { ratelimitPlugin } from "../../../plugins/ratelimit";

export const SignupRequest = new Elysia()

	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(clientTypePlugin())
	.use(
		ratelimitPlugin("signup-request", {
			maxTokens: 1000,
			refillRate: 500,
			refillInterval: {
				value: 10,
				unit: "m",
			},
		}),
	)
	.use(captchaPlugin())

	// Route
	.post(
		"/",
		async ({ containers, cookie, body: { email }, clientType, status }) => {
			const result = await containers.auth.signupRequestUseCase.execute(email);

			if (result.isErr) {
				const { code } = result;

				if (code === "EMAIL_ALREADY_USED") {
					return status("Bad Request", {
						code: code,
						message: "Email is already used. Please use a different email address or try logging in.",
					});
				}

				return status("Bad Request", {
					code: code,
					message: "Signup request failed. Please try again.",
				});
			}

			const { signupSessionToken, signupSession } = result.value;

			if (clientType === "mobile") {
				return {
					signupSessionToken: toAnySessionTokenResponse(signupSessionToken),
				};
			}

			cookie[SIGNUP_SESSION_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: signupSessionToken,
				expires: signupSession.expiresAt,
			});

			return status("No Content");
		},
		{
			beforeHandle: async ({ rateLimit, ipAddress, body: { email }, status }) => {
				const [ipAddressResult, emailResult] = await Promise.all([
					rateLimit.consume(ipAddress, 1),
					rateLimit.consume(email, 100),
				]);
				if (ipAddressResult.isErr || emailResult.isErr) {
					return status("Too Many Requests", {
						code: "TOO_MANY_REQUESTS",
						message: "Too many requests. Please try again later.",
					});
				}
				return;
			},
			cookie: t.Cookie({
				[SIGNUP_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				email: t.String({
					format: "email",
				}),
			}),
			detail: pathDetail({
				tag: "Auth",
				operationId: "auth-signup-request",
				summary: "Signup Request",
				description: "Signup Request endpoint for the User",
			}),
		},
	);
