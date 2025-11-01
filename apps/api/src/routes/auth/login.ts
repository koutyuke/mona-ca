import { Elysia, t } from "elysia";
import { defaultCookieOptions } from "../../core/infra/elysia";
import { SESSION_COOKIE_NAME } from "../../core/lib/http";
import { toAnySessionTokenResponse } from "../../features/auth";
import { captchaPlugin } from "../../plugins/captcha";
import { clientTypePlugin } from "../../plugins/client-type";
import { containerPlugin } from "../../plugins/container";
import { pathDetail } from "../../plugins/openapi";
import { ratelimitPlugin } from "../../plugins/ratelimit";

export const Login = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(clientTypePlugin())
	.use(
		ratelimitPlugin("login", {
			maxTokens: 1000,
			refillRate: 500,
			refillInterval: {
				value: 30,
				unit: "m",
			},
		}),
	)
	.use(captchaPlugin())

	// Route
	.post(
		"/login",
		async ({ clientType, cookie, body: { email, password }, containers, status }) => {
			const result = await containers.auth.loginUseCase.execute(email, password);

			if (result.isErr) {
				const { code } = result;

				if (code === "INVALID_CREDENTIALS") {
					return status("Bad Request", {
						code: "INVALID_CREDENTIALS",
						message: "Invalid email or password. Please check your credentials and try again.",
					});
				}
				return status("Bad Request", {
					code: code,
					message: "Login failed. Please try again.",
				});
			}
			const { session, sessionToken } = result.value;

			if (clientType === "mobile") {
				return {
					sessionToken: toAnySessionTokenResponse(sessionToken),
				};
			}

			cookie[SESSION_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: sessionToken,
				expires: session.expiresAt,
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
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				email: t.String({
					format: "email",
				}),
				password: t.String(),
			}),
			detail: pathDetail({
				operationId: "auth-login",
				summary: "Login",
				description: "Login to the application",
				tag: "Auth",
			}),
		},
	);
