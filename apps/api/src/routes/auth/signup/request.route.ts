import { SIGNUP_SESSION_COOKIE_NAME } from "@mona-ca/core/http";
import { Elysia, t } from "elysia";
import { match } from "ts-pattern";
import { isMobilePlatform } from "../../../core/domain/value-objects";
import { defaultCookieOptions, noContent } from "../../../core/infra/elysia";
import { toAnyTokenResponse } from "../../../features/auth";
import { captchaPlugin } from "../../../plugins/captcha";
import { clientPlatformPlugin } from "../../../plugins/client-platform";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";
import { ratelimitPlugin } from "../../../plugins/ratelimit";

export const SignupRequestRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(clientPlatformPlugin())
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
	.onBeforeHandle(async ({ rateLimit, ipAddress, status }) => {
		const result = await rateLimit.consume(ipAddress, 1);
		if (result.isErr) {
			return status("Too Many Requests", {
				code: "TOO_MANY_REQUESTS",
				message: "Too many requests. Please try again later.",
			});
		}
		return;
	})

	// Route
	.post(
		"",
		async ({ containers, cookie, body: { email }, clientPlatform, status, rateLimit }) => {
			const emailResult = await rateLimit.consume(email, 100);
			if (emailResult.isErr) {
				return status("Too Many Requests", {
					code: "TOO_MANY_REQUESTS",
					message: "Too many requests. Please try again later.",
				});
			}

			const result = await containers.auth.signupRequestUseCase.execute(email);

			if (result.isErr) {
				return match(result)
					.with({ code: "EMAIL_ALREADY_USED" }, () =>
						status("Bad Request", {
							code: "EMAIL_ALREADY_USED",
							message: "Email is already used. Please use a different email address or try logging in.",
						}),
					)
					.exhaustive();
			}

			const { signupSessionToken, signupSession } = result.value;

			if (isMobilePlatform(clientPlatform)) {
				return {
					signupSessionToken: toAnyTokenResponse(signupSessionToken),
				};
			}

			cookie[SIGNUP_SESSION_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: signupSessionToken,
				expires: signupSession.expiresAt,
			});

			return noContent();
		},
		{
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
