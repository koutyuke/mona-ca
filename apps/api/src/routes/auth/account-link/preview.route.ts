import { ACCOUNT_LINK_REQUEST_COOKIE_NAME } from "@mona-ca/core/http";
import { Elysia, t } from "elysia";
import { match } from "ts-pattern";
import { isMobilePlatform, isWebPlatform } from "../../../core/domain/value-objects";
import { newAccountLinkRequestToken, toAccountLinkPreviewResponse } from "../../../features/auth";
import { clientPlatformPlugin } from "../../../plugins/client-platform";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi/path-detail";

export const AccountLinkPreviewRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(clientPlatformPlugin())

	// Route
	.get(
		"/preview",
		async ({ containers, cookie, body, clientPlatform, status }) => {
			const rawAccountLinkRequestToken = match(clientPlatform)
				.when(isWebPlatform, () => cookie[ACCOUNT_LINK_REQUEST_COOKIE_NAME].value)
				.when(isMobilePlatform, () => body?.linkToken)
				.exhaustive();

			if (!rawAccountLinkRequestToken) {
				return status("Unauthorized", {
					code: "INVALID_ACCOUNT_LINK_REQUEST",
					message: "Account link request not found. Please login again.",
				});
			}

			const accountLinkRequestToken = newAccountLinkRequestToken(rawAccountLinkRequestToken);

			const validationResult = await containers.auth.accountLinkValidateRequestUseCase.execute(accountLinkRequestToken);

			if (validationResult.isErr) {
				return match(validationResult)
					.with({ code: "INVALID_ACCOUNT_LINK_REQUEST" }, ({ code }) => {
						return status("Unauthorized", {
							code,
							message: "Invalid account link request. Please login again.",
						});
					})
					.exhaustive();
			}

			const { accountLinkRequest } = validationResult.value;

			return toAccountLinkPreviewResponse(accountLinkRequest);
		},
		{
			cookie: t.Cookie({
				[ACCOUNT_LINK_REQUEST_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Optional(
				t.Object({
					linkToken: t.String(),
				}),
			),
			detail: pathDetail({
				tag: "Auth - Account Link",
				operationId: "auth-account-link-preview",
				summary: "Account Link Preview",
				description: "Preview the account link request",
			}),
		},
	);
