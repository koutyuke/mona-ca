import { Elysia, t } from "elysia";
import { defaultCookieOptions, noContent } from "../../../core/infra/elysia";
import { ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from "../../../core/lib/http";
import { newAccountAssociationSessionToken, toAnySessionTokenResponse } from "../../../features/auth";
import { clientTypePlugin } from "../../../plugins/client-type";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";
import { ratelimitPlugin } from "../../../plugins/ratelimit";

export const AccountAssociationConfirm = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(clientTypePlugin())
	.use(
		ratelimitPlugin("account-association-confirm", {
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
		"/confirm",
		async ({
			cookie,
			body: { accountAssociationSessionToken: bodyAccountAssociationSessionToken, code },
			clientType,
			rateLimit,
			containers,
			status,
		}) => {
			const rawAccountAssociationSessionToken =
				clientType === "web"
					? cookie[ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME].value
					: bodyAccountAssociationSessionToken;

			if (!rawAccountAssociationSessionToken) {
				return status("Unauthorized", {
					code: "ACCOUNT_ASSOCIATION_SESSION_INVALID",
					message: "Account association session not found. Please login again.",
				});
			}

			const validateResult = await containers.auth.validateAccountAssociationSessionUseCase.execute(
				newAccountAssociationSessionToken(rawAccountAssociationSessionToken),
			);

			if (validateResult.isErr) {
				const { code } = validateResult;

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

			const { accountAssociationSession, userIdentity } = validateResult.value;

			const ratelimitResult = await rateLimit.consume(userIdentity.id, 100);
			if (ratelimitResult.isErr) {
				return status("Too Many Requests", {
					code: "TOO_MANY_REQUESTS",
					message: "Too many requests. Please try again later.",
				});
			}

			const confirmResult = await containers.auth.accountAssociationConfirmUseCase.execute(
				code,
				userIdentity,
				accountAssociationSession,
			);

			if (confirmResult.isErr) {
				const { code } = confirmResult;

				if (code === "INVALID_ASSOCIATION_CODE") {
					return status("Bad Request", {
						code,
						message: "Invalid association code. Please check your email and try again.",
					});
				}
				if (code === "ACCOUNT_ALREADY_LINKED") {
					return status("Bad Request", {
						code,
						message: "This OAuth provider is already linked to your account.",
					});
				}
				if (code === "ACCOUNT_LINKED_ELSEWHERE") {
					return status("Bad Request", {
						code,
						message: "This OAuth account is already linked to another user.",
					});
				}
			}

			const { sessionToken, session } = confirmResult.value;

			if (clientType === "mobile") {
				return {
					sessionToken: toAnySessionTokenResponse(sessionToken),
				};
			}

			cookie[ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME].remove();
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
				[ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				accountAssociationSessionToken: t.Optional(t.String()),
				code: t.String(),
			}),
			detail: pathDetail({
				tag: "Auth - Account Association",
				operationId: "auth-account-association-confirm",
				summary: "Account Association Confirm",
				description: "Account Association Confirm endpoint for the User",
			}),
		},
	);
