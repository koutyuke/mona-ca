import { ACCOUNT_LINK_SESSION_COOKIE_NAME } from "@mona-ca/core/http";
import { Elysia, t } from "elysia";
import { match } from "ts-pattern";
import { isMobilePlatform, isWebPlatform } from "../../../core/domain/value-objects/client-platform";
import { newAccountLinkSessionToken, toAccountLinkPreviewResponse } from "../../../features/auth";
import { clientPlatformPlugin } from "../../../plugins/client-platform";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi/path-detail";

export const AccountLinkPreviewRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(clientPlatformPlugin())

	// Route
	.post(
		"/preview",
		async ({ containers, cookie, body, clientPlatform, status }) => {
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

			const validationResult = await containers.auth.accountLinkValidateSessionUseCase.execute(accountLinkSessionToken);

			if (validationResult.isErr) {
				return match(validationResult)
					.with({ code: "ACCOUNT_LINK_SESSION_INVALID" }, () => {
						return status("Unauthorized", {
							code: "ACCOUNT_LINK_SESSION_INVALID",
							message: "Invalid account link session. Please login again.",
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

			const { accountLinkSession } = validationResult.value;

			return toAccountLinkPreviewResponse(accountLinkSession);
		},
		{
			cookie: t.Cookie({
				[ACCOUNT_LINK_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				accountLinkSessionToken: t.Optional(t.String()),
			}),
			detail: pathDetail({
				tag: "Auth - Account Link",
				operationId: "account-link-preview",
				summary: "Account Link Preview",
				description: "Preview the account link",
			}),
		},
	);
