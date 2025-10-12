import { getMobileScheme, getWebBaseURL, validateRedirectURL } from "@mona-ca/core/utils";
import { err, isErr } from "../../../common/utils";
import { createOAuthAccount } from "../../../domain/entities";
import { type OAuthProvider, newClientType, newOAuthProviderId, newUserId } from "../../../domain/value-object";
import { type IOAuthProviderGateway, validateSignedState } from "../../../interface-adapter/gateway/oauth-provider";
import type { AppEnv } from "../../../modules/env";
import type { AccountLinkCallbackUseCaseResult, IAccountLinkCallbackUseCase } from "../../ports/in";
import type { IOAuthAccountRepository } from "../../ports/out/repositories";
import { accountLinkStateSchema } from "./schemas";

export class AccountLinkCallbackUseCase implements IAccountLinkCallbackUseCase {
	constructor(
		private readonly env: {
			APP_ENV: AppEnv["APP_ENV"];
			OAUTH_STATE_HMAC_SECRET: AppEnv["OAUTH_STATE_HMAC_SECRET"];
		},
		private readonly oauthProviderGateway: IOAuthProviderGateway,
		private readonly oauthAccountRepository: IOAuthAccountRepository,
	) {}

	public async execute(
		error: string | undefined,
		redirectURI: string,
		provider: OAuthProvider,
		signedState: string,
		code: string | undefined,
		codeVerifier: string,
	): Promise<AccountLinkCallbackUseCaseResult> {
		const validatedState = validateSignedState(signedState, this.env.OAUTH_STATE_HMAC_SECRET, accountLinkStateSchema);

		if (isErr(validatedState)) {
			return err("OAUTH_CREDENTIALS_INVALID");
		}

		const { client, uid } = validatedState;

		const clientType = newClientType(client);
		const userId = newUserId(uid);

		const clientBaseURL = clientType === "web" ? getWebBaseURL(this.env.APP_ENV === "production") : getMobileScheme();

		const redirectToClientURL = validateRedirectURL(clientBaseURL, redirectURI ?? "/");

		if (!redirectToClientURL) {
			return err("INVALID_REDIRECT_URL");
		}

		if (error) {
			if (error === "access_denied") {
				return err("OAUTH_ACCESS_DENIED", { redirectURL: redirectToClientURL });
			}

			return err("OAUTH_PROVIDER_ERROR", { redirectURL: redirectToClientURL });
		}

		if (!code) {
			return err("OAUTH_CREDENTIALS_INVALID");
		}

		const tokensResult = await this.oauthProviderGateway.getTokens(code, codeVerifier);

		if (isErr(tokensResult)) {
			switch (tokensResult.code) {
				case "OAUTH_CREDENTIALS_INVALID":
					return err("OAUTH_CREDENTIALS_INVALID");
				case "FAILED_TO_FETCH_OAUTH_TOKENS":
					return err("FAILED_TO_FETCH_OAUTH_ACCOUNT", { redirectURL: redirectToClientURL });
				default:
					return err("FAILED_TO_FETCH_OAUTH_ACCOUNT", { redirectURL: redirectToClientURL });
			}
		}

		const accountInfoResult = await this.oauthProviderGateway.getAccountInfo(tokensResult);

		await this.oauthProviderGateway.revokeToken(tokensResult);

		if (isErr(accountInfoResult)) {
			switch (accountInfoResult.code) {
				case "OAUTH_ACCESS_TOKEN_INVALID":
					return err("FAILED_TO_FETCH_OAUTH_ACCOUNT", { redirectURL: redirectToClientURL });
				case "FAILED_TO_GET_ACCOUNT_INFO":
					return err("FAILED_TO_FETCH_OAUTH_ACCOUNT", { redirectURL: redirectToClientURL });
				case "OAUTH_ACCOUNT_INFO_INVALID":
					return err("OAUTH_ACCOUNT_INFO_INVALID", { redirectURL: redirectToClientURL });
				default:
					return err("FAILED_TO_FETCH_OAUTH_ACCOUNT", { redirectURL: redirectToClientURL });
			}
		}

		const providerAccount = accountInfoResult;

		const providerId = newOAuthProviderId(providerAccount.id);

		const [existingOAuthAccount, existingUserLinkedAccount] = await Promise.all([
			this.oauthAccountRepository.findByProviderAndProviderId(provider, providerId),
			this.oauthAccountRepository.findByUserIdAndProvider(userId, provider),
		]);

		if (existingUserLinkedAccount) {
			return err("OAUTH_PROVIDER_ALREADY_LINKED", { redirectURL: redirectToClientURL });
		}

		if (existingOAuthAccount) {
			return err("OAUTH_ACCOUNT_ALREADY_LINKED_TO_ANOTHER_USER", { redirectURL: redirectToClientURL });
		}

		const oauthAccount = createOAuthAccount({
			provider,
			providerId,
			userId,
		});

		await this.oauthAccountRepository.save(oauthAccount);

		return {
			redirectURL: redirectToClientURL,
			clientType,
		};
	}
}
