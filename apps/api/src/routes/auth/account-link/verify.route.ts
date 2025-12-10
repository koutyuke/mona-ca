import { ACCOUNT_LINK_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from "@mona-ca/core/http";
import { Elysia, t } from "elysia";
import { match } from "ts-pattern";
import { isMobilePlatform, isWebPlatform } from "../../../core/domain/value-objects";
import { defaultCookieOptions, noContent } from "../../../core/infra/elysia";
import { newAccountLinkSessionToken, toAnyTokenResponse } from "../../../features/auth";
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
			body: { accountLinkSessionToken: bodyAccountLinkSessionToken, code },
			clientPlatform,
			rateLimit,
			containers,
			status,
		}) => {
			const rawAccountLinkSessionToken = match(clientPlatform)
				.when(isWebPlatform, () => cookie[ACCOUNT_LINK_SESSION_COOKIE_NAME].value)
				.when(isMobilePlatform, () => bodyAccountLinkSessionToken)
				.exhaustive();

			if (!rawAccountLinkSessionToken) {
				return status("Unauthorized", {
					code: "ACCOUNT_LINK_SESSION_INVALID",
					message: "Account link session not found.",
				});
			}

			const accountLinkSessionToken = newAccountLinkSessionToken(rawAccountLinkSessionToken);

			const validateResult = await containers.auth.accountLinkValidateSessionUseCase.execute(accountLinkSessionToken);

			if (validateResult.isErr) {
				return match(validateResult)
					.with({ code: "ACCOUNT_LINK_SESSION_INVALID" }, () => {
						return status("Unauthorized", {
							code: "ACCOUNT_LINK_SESSION_INVALID",
							message: "Invalid account link session.",
						});
					})
					.with({ code: "ACCOUNT_LINK_SESSION_EXPIRED" }, () => {
						return status("Unauthorized", {
							code: "ACCOUNT_LINK_SESSION_EXPIRED",
							message: "Account link session has expired.",
						});
					})
					.exhaustive();
			}

			const { accountLinkSession, userCredentials } = validateResult.value;

			const ratelimitResult = await rateLimit.consume(userCredentials.id, 100);
			if (ratelimitResult.isErr) {
				return status("Too Many Requests", {
					code: "TOO_MANY_REQUESTS",
					message: "Too many requests. Please try again later.",
				});
			}

			const verifyEmailResult = await containers.auth.accountLinkVerifyEmailUseCase.execute(
				code,
				userCredentials,
				accountLinkSession,
			);

			if (verifyEmailResult.isErr) {
				return match(verifyEmailResult)
					.with({ code: "INVALID_ASSOCIATION_CODE" }, () => {
						return status("Bad Request", {
							code: "INVALID_ASSOCIATION_CODE",
							message: "Invalid association code. Please check your email and try again.",
						});
					})
					.with({ code: "ACCOUNT_ALREADY_LINKED" }, () => {
						return status("Bad Request", {
							code: "ACCOUNT_ALREADY_LINKED",
							message: "This OAuth provider is already linked to your account.",
						});
					})
					.with({ code: "ACCOUNT_LINKED_ELSEWHERE" }, () => {
						return status("Bad Request", {
							code: "ACCOUNT_LINKED_ELSEWHERE",
							message: "This OAuth account is already linked to another user.",
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

			cookie[ACCOUNT_LINK_SESSION_COOKIE_NAME].remove();
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
				[ACCOUNT_LINK_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				accountLinkSessionToken: t.Optional(t.String()),
				code: t.String(),
			}),
			detail: pathDetail({
				tag: "Auth - Account Link",
				operationId: "account-link-verify",
				summary: "Account Link Verify",
				description: "Account Link Verify endpoint for the User",
			}),
		},
	);
