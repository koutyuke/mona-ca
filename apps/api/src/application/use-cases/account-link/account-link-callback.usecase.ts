import { getMobileScheme, getWebBaseURL, validateRedirectURL } from "@mona-ca/core/utils";
import { err, isErr } from "../../../common/utils";
import { createOAuthAccount } from "../../../domain/entities";
import { type OAuthProvider, newClientType, newOAuthProviderId, newUserId } from "../../../domain/value-object";
import { type IOAuthProviderGateway, validateSignedState } from "../../../interface-adapter/gateway/oauth-provider";
import type { IOAuthAccountRepository } from "../../../interface-adapter/repositories/oauth-account";
import type { AppEnv } from "../../../modules/env";
import type {
	AccountLinkCallbackUseCaseResult,
	IAccountLinkCallbackUseCase,
} from "./interfaces/account-link-callback.usecase.interface";
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
			return err("INVALID_OAUTH_STATE");
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
			return err("OAUTH_CODE_MISSING");
		}

		const tokens = await this.oauthProviderGateway.getTokens(code, codeVerifier);
		const accessToken = tokens.accessToken();

		const providerAccount = await this.oauthProviderGateway.getAccountInfo(accessToken);

		await this.oauthProviderGateway.revokeToken(accessToken);

		if (!providerAccount) {
			return err("OAUTH_PROVIDER_ERROR", { redirectURL: redirectToClientURL });
		}

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
