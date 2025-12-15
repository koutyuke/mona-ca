import { getMobileScheme, getWebBaseURL, validateRedirectURL } from "@mona-ca/core/http";
import { err, ok } from "@mona-ca/core/result";
import { newClientPlatform, newUserId } from "../../../../../core/domain/value-objects";
import { createProviderAccount } from "../../../domain/entities/provider-account";
import { newIdentityProvidersUserId } from "../../../domain/value-objects/identity-providers";

import type { IdentityProviders } from "../../../domain/value-objects/identity-providers";
import type {
	IProviderLinkCallbackUseCase,
	ProviderLinkCallbackUseCaseResult,
} from "../../contracts/provider-link/callback.usecase.interface";
import type { IIdentityProviderGateway } from "../../ports/gateways/identity-provider.gateway.interface";
import type { IHmacSignedStateService } from "../../ports/infra/hmac-signed-state.service.interface";
import type { IProviderAccountRepository } from "../../ports/repositories/provider-account.repository.interface";
import type { providerLinkStateSchema } from "./schema";

export class ProviderLinkCallbackUseCase implements IProviderLinkCallbackUseCase {
	constructor(
		// gateways
		private readonly discordIdentityProviderGateway: IIdentityProviderGateway,
		private readonly googleIdentityProviderGateway: IIdentityProviderGateway,
		// repositories
		private readonly providerAccountRepository: IProviderAccountRepository,
		private readonly providerLinkSignedStateService: IHmacSignedStateService<typeof providerLinkStateSchema>,
	) {}

	public async execute(
		production: boolean,
		error: string | undefined,
		redirectURI: string,
		provider: IdentityProviders,
		signedState: string,
		code: string | undefined,
		codeVerifier: string,
	): Promise<ProviderLinkCallbackUseCaseResult> {
		const identityProviderGateway =
			provider === "google" ? this.googleIdentityProviderGateway : this.discordIdentityProviderGateway;
		const validatedState = this.providerLinkSignedStateService.verify(signedState);

		if (validatedState.isErr) {
			return err("INVALID_STATE");
		}

		const { client, uid } = validatedState.value;

		const clientPlatform = newClientPlatform(client);
		const userId = newUserId(uid);

		const clientBaseURL = clientPlatform === "web" ? getWebBaseURL(production) : getMobileScheme(production);

		const redirectToClientURL = validateRedirectURL(clientBaseURL, redirectURI ?? "/");

		if (!redirectToClientURL) {
			return err("INVALID_REDIRECT_URI");
		}

		if (error) {
			if (error === "access_denied") {
				return err("PROVIDER_ACCESS_DENIED", { redirectURL: redirectToClientURL });
			}

			return err("PROVIDER_ERROR", { redirectURL: redirectToClientURL });
		}

		if (!code) {
			return err("TOKEN_EXCHANGE_FAILED");
		}

		const tokensResult = await identityProviderGateway.exchangeCodeForTokens(code, codeVerifier);

		if (tokensResult.isErr) {
			const { code } = tokensResult;

			if (code === "CREDENTIALS_INVALID" || code === "FETCH_TOKENS_FAILED") {
				return err("TOKEN_EXCHANGE_FAILED");
			}
		}

		const getIdentityProviderUserResult = await identityProviderGateway.getUserInfo(tokensResult.value);

		await identityProviderGateway.revokeToken(tokensResult.value);

		if (getIdentityProviderUserResult.isErr) {
			if (
				getIdentityProviderUserResult.code === "USER_INFO_GET_FAILED" ||
				getIdentityProviderUserResult.code === "INVALID_USER_INFO"
			) {
				return err("USER_INFO_GET_FAILED", { redirectURL: redirectToClientURL });
			}
		}

		const { userInfo } = getIdentityProviderUserResult.value;

		const providerUserId = newIdentityProvidersUserId(userInfo.id);

		const [existingProviderAccount, currentUserProviderAccount] = await Promise.all([
			this.providerAccountRepository.findByProviderAndProviderUserId(provider, providerUserId),
			this.providerAccountRepository.findByUserIdAndProvider(userId, provider),
		]);

		if (currentUserProviderAccount) {
			return err("PROVIDER_ALREADY_LINKED", { redirectURL: redirectToClientURL });
		}

		if (existingProviderAccount) {
			return err("ACCOUNT_LINKED_ELSEWHERE", { redirectURL: redirectToClientURL });
		}

		const providerAccount = createProviderAccount({
			provider,
			providerUserId,
			userId,
		});

		await this.providerAccountRepository.save(providerAccount);

		return ok({
			redirectURL: redirectToClientURL,
			clientPlatform,
		});
	}
}
