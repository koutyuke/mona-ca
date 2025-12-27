import { PASSWORD_RESET_SESSION_COOKIE_NAME } from "@mona-ca/core/http";
import Elysia, { t } from "elysia";
import { isMobilePlatform } from "../../../core/domain/value-objects";
import { defaultCookieOptions, noContent } from "../../../core/infra/elysia";
import { toAnyTokenResponse } from "../../../features/auth";
import { captchaPlugin } from "../../../plugins/captcha";
import { clientPlatformPlugin } from "../../../plugins/client-platform";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";
import { ratelimitPlugin } from "../../../plugins/ratelimit";

export const PasswordResetRequestRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(clientPlatformPlugin)
	.use(
		ratelimitPlugin("password-reset-request", {
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
		async ({ cookie, body: { email }, clientPlatform, containers, status, rateLimit }) => {
			const emailResult = await rateLimit.consume(email, 100);
			if (emailResult.isErr) {
				return status("Too Many Requests", {
					code: "TOO_MANY_REQUESTS",
					message: "Too many requests. Please try again later.",
				});
			}

			const result = await containers.auth.passwordResetRequestUseCase.execute(email);

			if (result.isErr) {
				return noContent();
			}

			const { passwordResetSessionToken, passwordResetSession } = result.value;

			if (isMobilePlatform(clientPlatform)) {
				return {
					passwordResetSessionToken: toAnyTokenResponse(passwordResetSessionToken),
				};
			}

			cookie[PASSWORD_RESET_SESSION_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: toAnyTokenResponse(passwordResetSessionToken),
				expires: passwordResetSession.expiresAt,
			});

			return noContent();
		},
		{
			cookie: t.Cookie({
				[PASSWORD_RESET_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				email: t.String({
					format: "email",
				}),
			}),
			detail: pathDetail({
				tag: "Auth - Password Reset",
				operationId: "auth-password-reset-request",
				summary: "Password Reset Request",
				description: "Password Reset Request endpoint for the User",
			}),
		},
	);
