import { SIGNUP_SESSION_COOKIE_NAME } from "@mona-ca/core/http";
import { Elysia, t } from "elysia";
import { match } from "ts-pattern";
import { isMobilePlatform, isWebPlatform } from "../../../core/domain/value-objects/client-platform";
import { noContent } from "../../../core/infra/elysia";
import { newSignupSessionToken } from "../../../features/auth";
import { clientPlatformPlugin } from "../../../plugins/client-platform";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";
import { ratelimitPlugin } from "../../../plugins/ratelimit";

export const SignupVerifyCode = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(clientPlatformPlugin())
	.use(
		ratelimitPlugin("signup-verify-code", {
			maxTokens: 1000,
			refillRate: 500,
			refillInterval: {
				value: 10,
				unit: "m",
			},
		}),
	)

	// Route
	.post(
		"/verify-code",
		async ({
			containers,
			cookie,
			body: { signupSessionToken: bodySignupSessionToken, code },
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
					code: "SIGNUP_SESSION_INVALID",
					message: "Signup session token not found. Please request signup again.",
				});
			}

			const signupSessionToken = newSignupSessionToken(rawSignupSessionToken);

			const validationResult = await containers.auth.signupValidateSessionUseCase.execute(signupSessionToken);

			if (validationResult.isErr) {
				return match(validationResult)
					.with({ code: "SIGNUP_SESSION_INVALID" }, ({ code }) =>
						status("Unauthorized", {
							code,
							message: "Signup session token is invalid. Please request signup again.",
						}),
					)
					.with({ code: "SIGNUP_SESSION_EXPIRED" }, ({ code }) =>
						status("Unauthorized", {
							code,
							message: "Signup session token has expired. Please request signup again.",
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

			const verifyResult = await containers.auth.signupVerifyCodeUseCase.execute(code, signupSession);

			if (verifyResult.isErr) {
				const { code } = verifyResult;

				if (code === "INVALID_VERIFICATION_CODE") {
					return status("Bad Request", {
						code: code,
						message: "Invalid verification code. Please check your email and try again.",
					});
				}
				if (code === "ALREADY_VERIFIED") {
					return status("Bad Request", {
						code: code,
						message: "Email is already verified. Please login.",
					});
				}
			}

			return noContent();
		},
		{
			beforeHandle: async ({ rateLimit, ipAddress, status }) => {
				// Rate Limit for IP Address
				const result = await rateLimit.consume(ipAddress, 1);
				if (result.isErr) {
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
				signupSessionToken: t.Optional(t.String()),
				code: t.String(),
			}),
			detail: pathDetail({
				operationId: "auth-signup-verify-code",
				summary: "Signup Verify Code",
				description: "Signup Verify Email endpoint for the User",
				tag: "Auth",
			}),
		},
	);
