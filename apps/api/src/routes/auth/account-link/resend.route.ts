import { ACCOUNT_LINK_REQUEST_COOKIE_NAME } from "@mona-ca/core/http";
import { Elysia, status, t } from "elysia";
import { match } from "ts-pattern";
import { isMobilePlatform, isWebPlatform } from "../../../core/domain/value-objects";
import { defaultCookieOptions, noContent } from "../../../core/infra/elysia";
import { newAccountLinkRequestToken, toAnyTokenResponse } from "../../../features/auth";
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
			const rawAccountLinkRequestToken = match(clientPlatform)
				.when(isWebPlatform, () => cookie[ACCOUNT_LINK_REQUEST_COOKIE_NAME].value)
				.when(isMobilePlatform, () => body?.accountLinkRequestToken)
				.exhaustive();

			if (!rawAccountLinkRequestToken) {
				return status("Unauthorized", {
					code: "INVALID_ACCOUNT_LINK_REQUEST",
					message: "Account link request not found. Please login again.",
				});
			}

			const accountLinkRequestToken = newAccountLinkRequestToken(rawAccountLinkRequestToken);

			const validateResult = await containers.auth.accountLinkValidateRequestUseCase.execute(accountLinkRequestToken);

			if (validateResult.isErr) {
				return match(validateResult)
					.with({ code: "INVALID_ACCOUNT_LINK_REQUEST" }, ({ code }) => {
						return status("Unauthorized", {
							code,
							message: "Invalid account link request. Please login again.",
						});
					})
					.exhaustive();
			}

			const { accountLinkRequest } = validateResult.value;

			const ratelimitResult = await rateLimit.consume(accountLinkRequest.userId, 100);

			if (ratelimitResult.isErr) {
				return status("Too Many Requests", {
					code: "TOO_MANY_REQUESTS",
					message: "Too many requests. Please try again later.",
				});
			}

			const result = await containers.auth.accountLinkReissueUseCase.execute(accountLinkRequest);
			const { accountLinkRequestToken: reissueAccountLinkRequestToken, accountLinkRequest: reissueAccountLinkRequest } =
				result.value;

			if (isMobilePlatform(clientPlatform)) {
				return {
					accountLinkRequestToken: toAnyTokenResponse(reissueAccountLinkRequestToken),
				};
			}

			cookie[ACCOUNT_LINK_REQUEST_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: toAnyTokenResponse(reissueAccountLinkRequestToken),
				expires: reissueAccountLinkRequest.expiresAt,
			});

			return noContent();
		},
		{
			cookie: t.Cookie({
				[ACCOUNT_LINK_REQUEST_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Optional(
				t.Object({
					accountLinkRequestToken: t.Optional(t.String()),
				}),
			),
			detail: pathDetail({
				tag: "Auth - Account Link",
				operationId: "auth-account-link-resend",
				summary: "Account Link Resend",
				description: "Account Link Resend endpoint for the User",
			}),
		},
	);
