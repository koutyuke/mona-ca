import { Elysia, status, t } from "elysia";
import { defaultCookieOptions } from "../../../core/infra/elysia";
import { ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME } from "../../../core/lib/http";
import { newAccountAssociationSessionToken } from "../../../features/auth";
import { clientTypePlugin } from "../../../plugins/client-type";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi/path-detail";
import { ratelimitPlugin } from "../../../plugins/ratelimit";

export const AccountAssociationChallenge = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(
		ratelimitPlugin("account-association-challenge", {
			maxTokens: 1000,
			refillRate: 500,
			refillInterval: {
				value: 10,
				unit: "m",
			},
		}),
	)
	.use(clientTypePlugin())
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
		async ({ containers, cookie, body, clientType, rateLimit }) => {
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

			const { accountAssociationSession: validateAccountAssociationSession } = validateResult.value;

			const ratelimitResult = await rateLimit.consume(validateAccountAssociationSession.userId, 100);

			if (ratelimitResult.isErr) {
				return status("Too Many Requests", {
					code: "TOO_MANY_REQUESTS",
					message: "Too many requests. Please try again later.",
				});
			}

			const { accountAssociationSessionToken, accountAssociationSession } =
				await containers.auth.accountAssociationChallengeUseCase.execute(validateAccountAssociationSession);

			if (clientType === "mobile") {
				return status("OK", {
					accountAssociationSessionToken,
				});
			}

			cookie[ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: accountAssociationSessionToken,
				expires: accountAssociationSession.expiresAt,
			});

			return status("No Content");
		},
		{
			cookie: t.Cookie({
				[ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Optional(
				t.Object({
					accountAssociationSessionToken: t.Optional(t.String()),
				}),
			),
			detail: pathDetail({
				tag: "Auth - Account Association",
				operationId: "account-association-challenge",
				summary: "Account Association Challenge",
				description: "Account Association Challenge endpoint for the User",
			}),
		},
	);
