import { ACCOUNT_LINK_SESSION_COOKIE_NAME } from "@mona-ca/core/http";
import { Elysia, status, t } from "elysia";
import { match } from "ts-pattern";
import { isMobilePlatform, isWebPlatform } from "../../../core/domain/value-objects/client-platform";
import { defaultCookieOptions, noContent } from "../../../core/infra/elysia";
import { newAccountLinkSessionToken, toAnyTokenResponse } from "../../../features/auth";
import { clientPlatformPlugin } from "../../../plugins/client-platform";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi/path-detail";
import { ratelimitPlugin } from "../../../plugins/ratelimit";

export const AccountLinkResendRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(
		ratelimitPlugin("account-link-resend", {
			maxTokens: 1000,
			refillRate: 500,
			refillInterval: {
				value: 10,
				unit: "m",
			},
		}),
	)
	.use(clientPlatformPlugin())
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
		"/resend",
		async ({ containers, cookie, body, clientPlatform, rateLimit }) => {
			const rawAccountLinkSessionToken = match(clientPlatform)
				.when(isWebPlatform, () => cookie[ACCOUNT_LINK_SESSION_COOKIE_NAME].value)
				.when(isMobilePlatform, () => body?.accountLinkSessionToken)
				.exhaustive();

			if (!rawAccountLinkSessionToken) {
				return status("Unauthorized", {
					code: "ACCOUNT_LINK_SESSION_INVALID",
					message: "Account link session not found. Please login again.",
				});
			}

			const accountLinkSessionToken = newAccountLinkSessionToken(rawAccountLinkSessionToken);

			const validateResult = await containers.auth.accountLinkValidateSessionUseCase.execute(accountLinkSessionToken);

			if (validateResult.isErr) {
				return match(validateResult)
					.with({ code: "ACCOUNT_LINK_SESSION_INVALID" }, () => {
						return status("Unauthorized", {
							code: "ACCOUNT_LINK_SESSION_INVALID",
							message: "Account link session not found. Please login again.",
						});
					})
					.with({ code: "ACCOUNT_LINK_SESSION_EXPIRED" }, () => {
						return status("Unauthorized", {
							code: "ACCOUNT_LINK_SESSION_EXPIRED",
							message: "Account link session has expired. Please login again.",
						});
					})
					.exhaustive();
			}

			const { accountLinkSession } = validateResult.value;

			const ratelimitResult = await rateLimit.consume(accountLinkSession.userId, 100);

			if (ratelimitResult.isErr) {
				return status("Too Many Requests", {
					code: "TOO_MANY_REQUESTS",
					message: "Too many requests. Please try again later.",
				});
			}

			const result = await containers.auth.accountLinkReissueSessionUseCase.execute(accountLinkSession);
			const { accountLinkSessionToken: reissueAccountLinkSessionToken, accountLinkSession: reissueAccountLinkSession } =
				result.value;

			if (isMobilePlatform(clientPlatform)) {
				return {
					accountLinkSessionToken: toAnyTokenResponse(reissueAccountLinkSessionToken),
				};
			}

			cookie[ACCOUNT_LINK_SESSION_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: toAnyTokenResponse(reissueAccountLinkSessionToken),
				expires: reissueAccountLinkSession.expiresAt,
			});

			return noContent();
		},
		{
			cookie: t.Cookie({
				[ACCOUNT_LINK_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Optional(
				t.Object({
					accountLinkSessionToken: t.Optional(t.String()),
				}),
			),
			detail: pathDetail({
				tag: "Auth - Account Link",
				operationId: "account-link-resend-email",
				summary: "Account Link Resend Email",
				description: "Account Link Resend Email endpoint for the User",
			}),
		},
	);
