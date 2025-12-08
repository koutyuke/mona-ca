import { SESSION_COOKIE_NAME } from "@mona-ca/core/http";
import { Elysia, t } from "elysia";
import { match } from "ts-pattern";
import { isMobilePlatform } from "../../core/domain/value-objects/client-platform";
import { defaultCookieOptions, noContent } from "../../core/infra/elysia";
import { toAnyTokenResponse } from "../../features/auth";
import { captchaPlugin } from "../../plugins/captcha";
import { clientPlatformPlugin } from "../../plugins/client-platform";
import { containerPlugin } from "../../plugins/container";
import { pathDetail } from "../../plugins/openapi";
import { ratelimitPlugin } from "../../plugins/ratelimit";

export const LoginRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(clientPlatformPlugin())
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
		async ({ clientPlatform, cookie, body: { email, password }, containers, status }) => {
			const result = await containers.auth.loginUseCase.execute(email, password);

			if (result.isErr) {
				return match(result)
					.with({ code: "INVALID_CREDENTIALS" }, () =>
						status("Bad Request", {
							code: "INVALID_CREDENTIALS",
							message: "Invalid email or password. Please check your credentials and try again.",
						}),
					)
					.exhaustive();
			}

			const { session, sessionToken } = result.value;

			if (isMobilePlatform(clientPlatform)) {
				return {
					sessionToken: toAnyTokenResponse(sessionToken),
				};
			}

			cookie[SESSION_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: toAnyTokenResponse(sessionToken),
				expires: session.expiresAt,
			});

			return noContent();
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
