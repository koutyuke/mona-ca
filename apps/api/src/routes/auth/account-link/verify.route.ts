import { ACCOUNT_LINK_REQUEST_COOKIE_NAME, SESSION_COOKIE_NAME } from "@mona-ca/core/http";
import { Elysia, t } from "elysia";
import { match } from "ts-pattern";
import { isMobilePlatform, isWebPlatform } from "../../../core/domain/value-objects";
import { defaultCookieOptions, noContent } from "../../../core/infra/elysia";
import { newAccountLinkRequestToken, toAnyTokenResponse } from "../../../features/auth";
import { clientPlatformPlugin } from "../../../plugins/client-platform";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi/path-detail";
import { ratelimitPlugin } from "../../../plugins/ratelimit";

export const AccountLinkVerifyRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(clientPlatformPlugin())
	.use(
		ratelimitPlugin("account-link-verify", {
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
			cookie,
			body: { accountLinkRequestToken: bodyAccountLinkRequestToken, code: verifyCode },
			clientPlatform,
			rateLimit,
			containers,
			status,
		}) => {
			const rawAccountLinkRequestToken = match(clientPlatform)
				.when(isWebPlatform, () => cookie[ACCOUNT_LINK_REQUEST_COOKIE_NAME].value)
				.when(isMobilePlatform, () => bodyAccountLinkRequestToken)
				.exhaustive();

			if (!rawAccountLinkRequestToken) {
				return status("Unauthorized", {
					code: "INVALID_ACCOUNT_LINK_REQUEST",
					message: "Account link request not found.",
				});
			}

			const accountLinkRequestToken = newAccountLinkRequestToken(rawAccountLinkRequestToken);

			const validateResult = await containers.auth.accountLinkValidateRequestUseCase.execute(accountLinkRequestToken);

			if (validateResult.isErr) {
				return match(validateResult)
					.with({ code: "INVALID_ACCOUNT_LINK_REQUEST" }, ({ code }) => {
						return status("Unauthorized", {
							code,
							message: "Invalid account link request.",
						});
					})
					.exhaustive();
			}

			const { accountLinkRequest, userCredentials } = validateResult.value;

			const ratelimitResult = await rateLimit.consume(userCredentials.id, 100);
			if (ratelimitResult.isErr) {
				return status("Too Many Requests", {
					code: "TOO_MANY_REQUESTS",
					message: "Too many requests. Please try again later.",
				});
			}

			const verifyEmailResult = await containers.auth.accountLinkVerifyEmailUseCase.execute(
				verifyCode,
				userCredentials,
				accountLinkRequest,
			);

			if (verifyEmailResult.isErr) {
				return match(verifyEmailResult)
					.with({ code: "INVALID_CODE" }, ({ code }) => {
						return status("Bad Request", {
							code,
							message: "Invalid code. Please check your email and try again.",
						});
					})
					.with({ code: "PROVIDER_ALREADY_LINKED" }, ({ code }) => {
						return status("Bad Request", {
							code,
							message: "This provider is already linked to your account. Please login with this provider.",
						});
					})
					.with({ code: "ACCOUNT_LINKED_ELSEWHERE" }, ({ code }) => {
						return status("Bad Request", {
							code,
							message: "This provider account is already linked to another user. Please login with this provider.",
						});
					})
					.exhaustive();
			}

			const { sessionToken, session } = verifyEmailResult.value;

			if (isMobilePlatform(clientPlatform)) {
				return {
					sessionToken: toAnyTokenResponse(sessionToken),
				};
			}

			cookie[ACCOUNT_LINK_REQUEST_COOKIE_NAME].remove();
			cookie[SESSION_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: sessionToken,
				expires: session.expiresAt,
			});

			return noContent();
		},
		{
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
				[ACCOUNT_LINK_REQUEST_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				accountLinkRequestToken: t.Optional(t.String()),
				code: t.String(),
			}),
			detail: pathDetail({
				tag: "Auth - Account Link",
				operationId: "auth-account-link-verify",
				summary: "Account Link Verify",
				description: "Account Link Verify endpoint for the User",
			}),
		},
	);
