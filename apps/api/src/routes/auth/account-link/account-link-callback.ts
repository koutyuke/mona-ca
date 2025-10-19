import { getAPIBaseURL } from "@mona-ca/core/utils";
import { t } from "elysia";
import { createOAuthGateway } from "../../../features/auth/adapters/gateways/oauth-provider";
import { ExternalIdentityRepository } from "../../../features/auth/adapters/repositories/external-identity/external-identity.repository";
import { AccountLinkCallbackUseCase } from "../../../features/auth/application/use-cases/account-link/account-link-callback.usecase";
import { accountLinkStateSchema } from "../../../features/auth/application/use-cases/account-link/schema";
import {
	externalIdentityProviderSchema,
	newExternalIdentityProvider,
} from "../../../features/auth/domain/value-objects/external-identity";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	RedirectResponse,
	RedirectResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../../plugins/elysia-with-env";
import { BadRequestException } from "../../../plugins/error";
import { pathDetail } from "../../../plugins/open-api";
import { HmacOAuthStateSigner } from "../../../shared/infra/crypto";
import { DrizzleService } from "../../../shared/infra/drizzle";
import { CookieManager } from "../../../shared/infra/elysia/cookie";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URI_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
	SESSION_COOKIE_NAME,
} from "../../../shared/lib/http";
import { timingSafeStringEqual } from "../../../shared/lib/security";

export const AccountLinkCallback = new ElysiaWithEnv()

	// Route
	.get(
		"/:provider/link/callback",
		async ({
			env: {
				APP_ENV,
				DISCORD_CLIENT_ID,
				DISCORD_CLIENT_SECRET,
				GOOGLE_CLIENT_ID,
				GOOGLE_CLIENT_SECRET,
				OAUTH_STATE_HMAC_SECRET,
			},
			cfModuleEnv: { DB },
			cookie,
			params: { provider: _provider },
			query: { code, state: queryState, error },
		}) => {
			// === Instances ===
			const provider = newExternalIdentityProvider(_provider);

			const apiBaseURL = getAPIBaseURL(APP_ENV === "production");

			const providerRedirectURL = new URL(`auth/${provider}/link/callback`, apiBaseURL);

			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const externalIdentityRepository = new ExternalIdentityRepository(drizzleService);

			const oauthStateSigner = new HmacOAuthStateSigner(OAUTH_STATE_HMAC_SECRET, accountLinkStateSchema);

			const oauthProviderGateway = createOAuthGateway(
				{
					DISCORD_CLIENT_ID,
					DISCORD_CLIENT_SECRET,
					GOOGLE_CLIENT_ID,
					GOOGLE_CLIENT_SECRET,
				},
				provider,
				providerRedirectURL.toString(),
			);

			const accountLinkCallbackUseCase = new AccountLinkCallbackUseCase(
				oauthProviderGateway,
				externalIdentityRepository,
				oauthStateSigner,
			);
			// === End of instances ===

			const signedState = cookieManager.getCookie(OAUTH_STATE_COOKIE_NAME);
			const codeVerifier = cookieManager.getCookie(OAUTH_CODE_VERIFIER_COOKIE_NAME);
			const redirectURI = cookieManager.getCookie(OAUTH_REDIRECT_URI_COOKIE_NAME);

			if (!queryState || !timingSafeStringEqual(queryState, signedState)) {
				throw new BadRequestException({
					code: "INVALID_STATE",
				});
			}

			const result = await accountLinkCallbackUseCase.execute(
				APP_ENV === "production",
				error,
				redirectURI,
				provider,
				signedState,
				code,
				codeVerifier,
			);

			cookieManager.deleteCookie(OAUTH_STATE_COOKIE_NAME);
			cookieManager.deleteCookie(OAUTH_CODE_VERIFIER_COOKIE_NAME);
			cookieManager.deleteCookie(OAUTH_REDIRECT_URI_COOKIE_NAME);

			if (result.isErr) {
				const { code } = result;

				if (code === "INVALID_STATE") {
					throw new BadRequestException({
						code: code,
						message: "Invalid OAuth state. Please try again.",
					});
				}
				if (code === "INVALID_REDIRECT_URI") {
					throw new BadRequestException({
						code: code,
						message: "Invalid redirect URL. Please check the URL and try again.",
					});
				}
				if (code === "TOKEN_EXCHANGE_FAILED") {
					throw new BadRequestException({
						code: code,
						message: "OAuth code is missing. Please try again.",
					});
				}

				const {
					code: errorCode,
					context: { redirectURL },
				} = result;

				redirectURL.searchParams.set("error", errorCode);
				return RedirectResponse(redirectURL.toString());
			}

			const { redirectURL } = result.value;

			return RedirectResponse(redirectURL.toString());
		},
		{
			query: t.Object(
				{
					code: t.Optional(
						t.String({
							minLength: 1,
						}),
					),
					state: t.Optional(
						t.String({
							minLength: 1,
						}),
					),
					error: t.Optional(t.String()),
				},
				{ additionalProperties: true },
			),
			params: t.Object({
				provider: externalIdentityProviderSchema,
			}),
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
				[OAUTH_STATE_COOKIE_NAME]: t.String({
					minLength: 1,
				}),
				[OAUTH_REDIRECT_URI_COOKIE_NAME]: t.String({
					minLength: 1,
				}),
				[OAUTH_CODE_VERIFIER_COOKIE_NAME]: t.String({
					minLength: 1,
				}),
			}),
			response: withBaseResponseSchema({
				302: RedirectResponseSchema,
				400: ResponseTUnion(
					ErrorResponseSchema("INVALID_STATE"),
					ErrorResponseSchema("INVALID_REDIRECT_URI"),
					ErrorResponseSchema("TOKEN_EXCHANGE_FAILED"),
				),
			}),
			detail: pathDetail({
				operationId: "auth-account-link-callback",
				summary: "Account Link Callback",
				description: [
					"Account Link Callback for the provider",
					"##### **Error Query**",
					"---",
					"- **PROVIDER_ACCESS_DENIED**",
					"- **PROVIDER_ERROR**",
					"- **GET_IDENTITY_FAILED**",
					"- **PROVIDER_ALREADY_LINKED**",
					"- **ACCOUNT_LINKED_ELSEWHERE**",
				],
				tag: "Auth - Account Link",
				withAuth: true,
			}),
		},
	);
