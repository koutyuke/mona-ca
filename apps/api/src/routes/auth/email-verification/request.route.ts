import { EMAIL_VERIFICATION_SESSION_COOKIE_NAME } from "@mona-ca/core/http";
import { Elysia, t } from "elysia";
import { match } from "ts-pattern";
import { isMobilePlatform } from "../../../core/domain/value-objects";
import { defaultCookieOptions, noContent } from "../../../core/infra/elysia";
import { toAnyTokenResponse } from "../../../features/auth";
import { authPlugin } from "../../../plugins/auth";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";
import { ratelimitPlugin } from "../../../plugins/ratelimit";

export const EmailVerificationRequestRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
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
	.use(authPlugin({ withEmailVerification: false }))

	// Route
	.post(
		"/",
		async ({ cookie, userCredentials, clientPlatform, containers, status }) => {
			const result = await containers.auth.emailVerificationRequestUseCase.execute(userCredentials);

			if (result.isErr) {
				return match(result)
					.with({ code: "EMAIL_ALREADY_VERIFIED" }, () =>
						status("Bad Request", {
							code: "EMAIL_ALREADY_VERIFIED",
							message: "Email is already verified. Please use a different email address.",
						}),
					)
					.with({ code: "EMAIL_ALREADY_REGISTERED" }, () =>
						status("Bad Request", {
							code: "EMAIL_ALREADY_REGISTERED",
							message: "Email is already registered by another user. Please use a different email address.",
						}),
					)
					.exhaustive();
			}

			const { emailVerificationSession, emailVerificationSessionToken } = result.value;

			if (isMobilePlatform(clientPlatform)) {
				return {
					emailVerificationSessionToken: toAnyTokenResponse(emailVerificationSessionToken),
				};
			}

			cookie[EMAIL_VERIFICATION_SESSION_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: toAnyTokenResponse(emailVerificationSessionToken),
				expires: emailVerificationSession.expiresAt,
			});

			return noContent();
		},
		{
			beforeHandle: async ({ rateLimit, ipAddress, status, userCredentials: { email } }) => {
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
				[EMAIL_VERIFICATION_SESSION_COOKIE_NAME]: t.Optional(t.String()),
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
