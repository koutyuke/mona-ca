import { Elysia, t } from "elysia";
import { SIGNUP_SESSION_COOKIE_NAME } from "../../../core/lib/http";
import { newSignupSessionToken } from "../../../features/auth";
import { clientTypePlugin } from "../../../plugins/client-type";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";
import { ratelimitPlugin } from "../../../plugins/ratelimit";

export const SignupVerifyEmail = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(clientTypePlugin())
	.use(
		ratelimitPlugin("signup-verify-email", {
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
		"/verify-email",
		async ({
			containers,
			cookie,
			body: { signupSessionToken: bodySignupSessionToken, code },
			clientType,
			rateLimit,
			status,
		}) => {
			const rawSignupSessionToken =
				clientType === "web" ? cookie[SIGNUP_SESSION_COOKIE_NAME].value : bodySignupSessionToken;

			if (!rawSignupSessionToken) {
				return status("Unauthorized", {
					code: "SIGNUP_SESSION_INVALID",
					message: "Signup session token not found. Please request signup again.",
				});
			}

			const validationResult = await containers.auth.validateSignupSessionUseCase.execute(
				newSignupSessionToken(rawSignupSessionToken),
			);

			if (validationResult.isErr) {
				const { code } = validationResult;

				if (code === "SIGNUP_SESSION_INVALID") {
					return status("Unauthorized", {
						code: code,
						message: "Signup session token is invalid. Please request signup again.",
					});
				}
				if (code === "SIGNUP_SESSION_EXPIRED") {
					return status("Unauthorized", {
						code: code,
						message: "Signup session token has expired. Please request signup again.",
					});
				}
			}

			const { signupSession } = validationResult.value;

			const ratelimitResult = await rateLimit.consume(signupSession.id, 100);
			if (ratelimitResult.isErr) {
				return status("Too Many Requests", {
					code: "TOO_MANY_REQUESTS",
					message: "Too many requests. Please try again later.",
				});
			}

			const verifyEmailResult = await containers.auth.signupVerifyEmailUseCase.execute(code, signupSession);

			if (verifyEmailResult.isErr) {
				const { code } = verifyEmailResult;

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

			return status("No Content");
		},
		{
			cookie: t.Cookie({
				[SIGNUP_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				signupSessionToken: t.Optional(t.String()),
				code: t.String(),
			}),
			detail: pathDetail({
				operationId: "auth-signup-verify-email",
				summary: "Signup Verify Email",
				description: "Signup Verify Email endpoint for the User",
				tag: "Auth",
			}),
		},
	);
