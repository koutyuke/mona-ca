import Elysia, { t } from "elysia";
import { defaultCookieOptions, noContent } from "../../../core/infra/elysia";
import { PASSWORD_RESET_SESSION_COOKIE_NAME } from "../../../core/lib/http";
import { toAnySessionTokenResponse } from "../../../features/auth";
import { captchaPlugin } from "../../../plugins/captcha";
import { clientTypePlugin } from "../../../plugins/client-type";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";
import { ratelimitPlugin } from "../../../plugins/ratelimit";

const PasswordResetRequest = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(clientTypePlugin)
	.use(
		ratelimitPlugin("forgot-password-request", {
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
		async ({ cookie, body: { email }, clientType, containers }) => {
			const result = await containers.auth.passwordResetRequestUseCase.execute(email);

			if (result.isErr) {
				return noContent();
			}

			const { passwordResetSessionToken, passwordResetSession } = result.value;

			if (clientType === "mobile") {
				return {
					passwordResetSessionToken: toAnySessionTokenResponse(passwordResetSessionToken),
				};
			}

			cookie[PASSWORD_RESET_SESSION_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: passwordResetSessionToken,
				expires: passwordResetSession.expiresAt,
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
				[PASSWORD_RESET_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				email: t.String({
					format: "email",
				}),
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
