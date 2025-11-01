import { Elysia, t } from "elysia";
import { defaultCookieOptions } from "../../../core/infra/elysia";
import { EMAIL_VERIFICATION_SESSION_COOKIE_NAME } from "../../../core/lib/http";
import { authPlugin } from "../../../plugins/auth";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";
import { ratelimitPlugin } from "../../../plugins/ratelimit";

export const EmailVerificationRequest = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(authPlugin({ requireEmailVerification: false }))
	.use(
		ratelimitPlugin("email-verification-request", {
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
		"/",
		async ({ cookie, body: { email: bodyEmail }, userIdentity, clientType, rateLimit, containers, status }) => {
			const email = bodyEmail ?? userIdentity.email;

			const ratelimitResult = await rateLimit.consume(email, 100);
			if (ratelimitResult.isErr) {
				return status("Too Many Requests", {
					code: "TOO_MANY_REQUESTS",
					message: "Too many requests. Please try again later.",
				});
			}

			const result = await containers.auth.emailVerificationRequestUseCase.execute(email, userIdentity);

			if (result.isErr) {
				const { code } = result;

				if (code === "EMAIL_ALREADY_VERIFIED") {
					return status("Bad Request", {
						code: code,
						message: "Email is already verified. Please use a different email address.",
					});
				}
				if (code === "EMAIL_ALREADY_REGISTERED") {
					return status("Bad Request", {
						code: code,
						message: "Email is already registered by another user. Please use a different email address.",
					});
				}
			}

			const { emailVerificationSession, emailVerificationSessionToken } = result.value;

			if (clientType === "mobile") {
				return {
					emailVerificationSessionToken,
				};
			}

			cookie[EMAIL_VERIFICATION_SESSION_COOKIE_NAME].set({
				...defaultCookieOptions,
				expires: emailVerificationSession.expiresAt,
				value: emailVerificationSessionToken,
			});

			return status("No Content");
		},
		{
			cookie: t.Cookie({
				[EMAIL_VERIFICATION_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				email: t.Nullable(
					t.String({
						format: "email",
					}),
				),
			}),
			detail: pathDetail({
				operationId: "auth-email-verification-request",
				summary: "Email Verification Request",
				description: "The User can request email verification by this endpoint",
				tag: "Auth - Email Verification",
				withAuth: true,
			}),
		},
	);
