import { Elysia, t } from "elysia";
import { externalIdentityProviderSchema, newExternalIdentityProvider } from "../../../features/auth";
import { di } from "../../../plugins/di";
import { pathDetail } from "../../../plugins/open-api";
import { env } from "../../../shared/infra/config/env";
import {
	BadRequestException,
	CookieManager,
	ErrorResponseSchema,
	RedirectResponse,
	RedirectResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../../shared/infra/elysia";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URI_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
	SESSION_COOKIE_NAME,
} from "../../../shared/lib/http";
import { timingSafeStringEqual } from "../../../shared/lib/security";

export const AccountLinkCallback = new Elysia()
	// Local Middleware & Plugin
	.use(di())

	// Route
	.get(
		"/:provider/link/callback",
		async ({ cookie, params: { provider: _provider }, query: { code, state: queryState, error }, containers }) => {
			const provider = newExternalIdentityProvider(_provider);

			const cookieManager = new CookieManager(env.APP_ENV === "production", cookie);

			const signedState = cookieManager.getCookie(OAUTH_STATE_COOKIE_NAME);
			const codeVerifier = cookieManager.getCookie(OAUTH_CODE_VERIFIER_COOKIE_NAME);
			const redirectURI = cookieManager.getCookie(OAUTH_REDIRECT_URI_COOKIE_NAME);

			if (!queryState || !timingSafeStringEqual(queryState, signedState)) {
				throw new BadRequestException({
					code: "INVALID_STATE",
				});
			}

			const result = await containers.auth.accountLinkCallbackUseCase.execute(
				env.APP_ENV === "production",
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
