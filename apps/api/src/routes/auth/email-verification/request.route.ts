import { EMAIL_VERIFICATION_REQUEST_COOKIE_NAME } from "@mona-ca/core/http";
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
		async ({ cookie, userCredentials, clientPlatform, containers, status, rateLimit }) => {
			const emailResult = await rateLimit.consume(userCredentials.email, 100);
			if (emailResult.isErr) {
				return status("Too Many Requests", {
					code: "TOO_MANY_REQUESTS",
					message: "Too many requests. Please try again later.",
				});
			}

			const result = await containers.auth.emailVerificationRequestUseCase.execute(userCredentials);

			if (result.isErr) {
				return match(result)
					.with({ code: "EMAIL_ALREADY_VERIFIED" }, ({ code }) =>
						status("Bad Request", {
							code,
							message: "Email is already verified. Please use a different email address.",
						}),
					)
					.with({ code: "EMAIL_ALREADY_REGISTERED" }, ({ code }) =>
						status("Bad Request", {
							code,
							message: "Email is already registered by another user. Please use a different email address.",
						}),
					)
					.exhaustive();
			}

			const { emailVerificationRequest, emailVerificationRequestToken } = result.value;

			if (isMobilePlatform(clientPlatform)) {
				return {
					verificationToken: toAnyTokenResponse(emailVerificationRequestToken),
				};
			}

			cookie[EMAIL_VERIFICATION_REQUEST_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: toAnyTokenResponse(emailVerificationRequestToken),
				expires: emailVerificationRequest.expiresAt,
			});

			return noContent();
		},
		{
			cookie: t.Cookie({
				[EMAIL_VERIFICATION_REQUEST_COOKIE_NAME]: t.Optional(t.String()),
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
