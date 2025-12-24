import { EMAIL_VERIFICATION_REQUEST_COOKIE_NAME } from "@mona-ca/core/http";
import { Elysia, t } from "elysia";
import { match } from "ts-pattern";
import { isMobilePlatform } from "../../../../core/domain/value-objects";
import { defaultCookieOptions, noContent } from "../../../../core/infra/elysia";
import { toAnyTokenResponse } from "../../../../features/auth";
import { authPlugin } from "../../../../plugins/auth";
import { containerPlugin } from "../../../../plugins/container";
import { pathDetail } from "../../../../plugins/openapi";
import { ratelimitPlugin } from "../../../../plugins/ratelimit";

export const UpdateEmailRequestRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(authPlugin())
	.use(
		ratelimitPlugin("update-email-request", {
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
		async ({ cookie, body: { email: bodyEmail }, userCredentials, clientPlatform, rateLimit, containers, status }) => {
			const email = bodyEmail ?? userCredentials.email;

			const ratelimitResult = await rateLimit.consume(email, 100);
			if (ratelimitResult.isErr) {
				return status("Too Many Requests", {
					code: "TOO_MANY_REQUESTS",
					message: "Too many requests. Please try again later.",
				});
			}

			const result = await containers.auth.updateEmailRequestUseCase.execute(email, userCredentials);

			if (result.isErr) {
				return match(result)
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
					emailVerificationRequestToken: toAnyTokenResponse(emailVerificationRequestToken),
				};
			}

			cookie[EMAIL_VERIFICATION_REQUEST_COOKIE_NAME].set({
				...defaultCookieOptions,
				expires: emailVerificationRequest.expiresAt,
				value: toAnyTokenResponse(emailVerificationRequestToken),
			});

			return noContent();
		},
		{
			cookie: t.Cookie({
				[EMAIL_VERIFICATION_REQUEST_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				email: t.Nullable(
					t.String({
						format: "email",
					}),
				),
			}),
			detail: pathDetail({
				operationId: "me-update-email-request",
				summary: "Update Email Request",
				description: "The User can request to update their email by this endpoint",
				tag: "Me",
				withAuth: true,
			}),
		},
	);
