import { Elysia, t } from "elysia";
import { ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME } from "../../../core/lib/http";
import { newAccountAssociationSessionToken, toAccountAssociationPreviewResponse } from "../../../features/auth";
import { toProfileResponse } from "../../../features/user";
import { clientTypePlugin } from "../../../plugins/client-type";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";

export const AccountAssociationPreview = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(clientTypePlugin())

	// Route
	.post(
		"/preview",
		async ({ containers, cookie, body, clientType, status }) => {
			const rawAccountAssociationSessionToken =
				clientType === "web"
					? cookie[ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME].value
					: body?.accountAssociationSessionToken;

			if (!rawAccountAssociationSessionToken) {
				return status("Unauthorized", {
					code: "ACCOUNT_ASSOCIATION_SESSION_INVALID",
					message: "Account association session not found. Please login again.",
				});
			}

			const result = await containers.auth.validateAccountAssociationSessionUseCase.execute(
				newAccountAssociationSessionToken(rawAccountAssociationSessionToken),
			);

			if (result.isErr) {
				const { code } = result;

				if (code === "ACCOUNT_ASSOCIATION_SESSION_INVALID") {
					return status("Unauthorized", {
						code: code,
						message: "Invalid account association session. Please login again.",
					});
				}
				if (code === "ACCOUNT_ASSOCIATION_SESSION_EXPIRED") {
					return status("Unauthorized", {
						code: code,
						message: "Account association session has expired. Please login again.",
					});
				}
			}

			const { userIdentity, accountAssociationSession } = result.value;

			const profile = await containers.user.getProfileUseCase.execute(userIdentity.id);
			if (profile.isErr) {
				return status("Bad Request", {
					code: profile.code,
					message: "Failed to get profile",
				});
			}

			return {
				user: toProfileResponse(profile.value.profile),
				...toAccountAssociationPreviewResponse(accountAssociationSession),
			};
		},
		{
			cookie: t.Cookie({
				[ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				accountAssociationSessionToken: t.Optional(t.String()),
			}),
			detail: pathDetail({
				tag: "Auth - Account Association",
				operationId: "account-association-preview",
				summary: "Account Association Preview",
				description: "Preview the account association",
			}),
		},
	);
