import { SIGNUP_SESSION_COOKIE_NAME } from "@mona-ca/core/http";
import { Elysia, t } from "elysia";
import { match } from "ts-pattern";
import { isMobilePlatform, isWebPlatform } from "../../../core/domain/value-objects";
import { noContent } from "../../../core/infra/elysia";
import { newSignupSessionToken } from "../../../features/auth";
import { clientPlatformPlugin } from "../../../plugins/client-platform";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";
import { ratelimitPlugin } from "../../../plugins/ratelimit";

export const SignupVerifyRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(clientPlatformPlugin())
	.use(
		ratelimitPlugin("signup-verify", {
			maxTokens: 1000,
			refillRate: 500,
			refillInterval: {
				value: 10,
				unit: "m",
			},
		}),
	)
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
		"/verify",
		async ({
			containers,
			cookie,
			body: { signupToken: bodySignupSessionToken, code: verifyCode },
			clientPlatform,
			rateLimit,
			status,
		}) => {
			// Validate Signup Session

			const rawSignupSessionToken = match(clientPlatform)
				.when(isWebPlatform, () => cookie[SIGNUP_SESSION_COOKIE_NAME].value)
				.when(isMobilePlatform, () => bodySignupSessionToken)
				.exhaustive();

			if (!rawSignupSessionToken) {
				return status("Unauthorized", {
					code: "INVALID_SIGNUP_SESSION",
					message: "Signup session token not found. Please request signup again.",
				});
			}

			const signupSessionToken = newSignupSessionToken(rawSignupSessionToken);

			const validationResult = await containers.auth.signupValidateSessionUseCase.execute(signupSessionToken);

			if (validationResult.isErr) {
				return match(validationResult)
					.with({ code: "INVALID_SIGNUP_SESSION" }, ({ code }) =>
						status("Unauthorized", {
							code,
							message: "Signup session token is invalid. Please request signup again.",
						}),
					)
					.exhaustive();
			}

			const { signupSession } = validationResult.value;

			const ratelimitResult = await rateLimit.consume(signupSession.id, 100);
			if (ratelimitResult.isErr) {
				return status("Too Many Requests", {
					code: "TOO_MANY_REQUESTS",
					message: "Too many requests. Please try again later.",
				});
			}

			// Main Logic

			const verifyEmailResult = await containers.auth.signupVerifyEmailUseCase.execute(verifyCode, signupSession);

			if (verifyEmailResult.isErr) {
				return match(verifyEmailResult)
					.with({ code: "INVALID_CODE" }, ({ code }) =>
						status("Bad Request", {
							code,
							message: "Invalid verification code. Please check your email and try again.",
						}),
					)
					.with({ code: "ALREADY_VERIFIED" }, ({ code }) =>
						status("Bad Request", {
							code,
							message: "Email is already verified. Please login.",
						}),
					)
					.exhaustive();
			}

			return noContent();
		},
		{
			cookie: t.Cookie({
				[SIGNUP_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				signupToken: t.Optional(t.String()),
				code: t.String(),
			}),
			detail: pathDetail({
				operationId: "auth-signup-verify",
				summary: "Signup Verify",
				description: "Signup Verify Email endpoint for the User",
				tag: "Auth",
			}),
		},
	);
