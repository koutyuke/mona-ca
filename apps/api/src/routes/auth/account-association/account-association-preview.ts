import { Elysia, t } from "elysia";
import { env } from "../../../core/infra/config/env";
import {
	BadRequestException,
	CookieManager,
	ErrorResponseSchema,
	ResponseTUnion,
	UnauthorizedException,
	withBaseResponseSchema,
} from "../../../core/infra/elysia";
import { ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME } from "../../../core/lib/http";
import { newAccountAssociationSessionToken } from "../../../features/auth";
import { ProfileResponseSchema, toProfileResponse } from "../../../features/user";
import { di } from "../../../plugins/di";
import { pathDetail } from "../../../plugins/openapi";
import { WithClientTypeSchema, withClientType } from "../../../plugins/with-client-type";

export const AccountAssociationPreview = new Elysia()
	// Local Middleware & Plugin
	.use(di())
	.use(withClientType)

	// Route
	.post(
		"/association/preview",
		async ({ containers, cookie, body, clientType }) => {
			const cookieManager = new CookieManager(env.APP_ENV === "production", cookie);

			const rawAccountAssociationSessionToken =
				clientType === "web"
					? cookieManager.getCookie(ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME)
					: body?.accountAssociationSessionToken;

			if (!rawAccountAssociationSessionToken) {
				throw new UnauthorizedException({
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
					throw new UnauthorizedException({
						code: code,
						message: "Invalid account association session. Please login again.",
					});
				}
				if (code === "ACCOUNT_ASSOCIATION_SESSION_EXPIRED") {
					throw new UnauthorizedException({
						code: code,
						message: "Account association session has expired. Please login again.",
					});
				}
			}

			const { userIdentity, accountAssociationSession } = result.value;

			const profile = await containers.user.getProfileUseCase.execute(userIdentity.id);
			if (profile.isErr) {
				throw new BadRequestException({
					code: profile.code,
					message: "Failed to get profile",
				});
			}

			return {
				user: toProfileResponse(profile.value.profile),
				provider: accountAssociationSession.provider,
				providerId: accountAssociationSession.providerUserId,
			};
		},
		{
			headers: WithClientTypeSchema.headers,
			cookie: t.Cookie({
				[ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				accountAssociationSessionToken: t.Optional(t.String()),
			}),
			response: withBaseResponseSchema({
				200: t.Object({
					user: ProfileResponseSchema,
					provider: t.String(),
					providerId: t.String(),
				}),
				400: WithClientTypeSchema.response[400],
				401: ResponseTUnion(
					ErrorResponseSchema("PROFILE_NOT_FOUND"),
					ErrorResponseSchema("ACCOUNT_ASSOCIATION_SESSION_INVALID"),
					ErrorResponseSchema("ACCOUNT_ASSOCIATION_SESSION_EXPIRED"),
				),
			}),
			detail: pathDetail({
				tag: "Auth - Account Association",
				operationId: "account-association-preview",
				summary: "Account Association Preview",
				description: "Preview the account association",
			}),
		},
	);
