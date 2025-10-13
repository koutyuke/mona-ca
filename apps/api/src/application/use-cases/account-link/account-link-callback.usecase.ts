import { getMobileScheme, getWebBaseURL, validateRedirectURL } from "@mona-ca/core/utils";
import { err, isErr } from "../../../common/utils";
import { createExternalIdentity } from "../../../domain/entities";
import {
	type ExternalIdentityProvider,
	newClientType,
	newExternalIdentityProviderUserId,
	newUserId,
} from "../../../domain/value-object";
import type { AccountLinkCallbackUseCaseResult, IAccountLinkCallbackUseCase } from "../../ports/in";
import type { IOAuthProviderGateway } from "../../ports/out/gateways";
import type { IExternalIdentityRepository } from "../../ports/out/repositories";
import type { IOAuthStateSigner } from "../../ports/out/system";
import type { accountLinkStateSchema } from "./schema";

export class AccountLinkCallbackUseCase implements IAccountLinkCallbackUseCase {
	constructor(
		private readonly oauthProviderGateway: IOAuthProviderGateway,
		private readonly externalIdentityRepository: IExternalIdentityRepository,
		private readonly oauthStateSigner: IOAuthStateSigner<typeof accountLinkStateSchema>,
	) {}

	public async execute(
		production: boolean,
		error: string | undefined,
		redirectURI: string,
		provider: ExternalIdentityProvider,
		signedState: string,
		code: string | undefined,
		codeVerifier: string,
	): Promise<AccountLinkCallbackUseCaseResult> {
		const validatedState = this.oauthStateSigner.validate(signedState);

		if (isErr(validatedState)) {
			return err("INVALID_STATE");
		}

		const { client, uid } = validatedState;

		const clientType = newClientType(client);
		const userId = newUserId(uid);

		const clientBaseURL = clientType === "web" ? getWebBaseURL(production) : getMobileScheme();

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

		const tokensResult = await this.oauthProviderGateway.exchangeCodeForTokens(code, codeVerifier);

		if (isErr(tokensResult)) {
			const { code } = tokensResult;

			if (code === "CREDENTIALS_INVALID" || code === "FETCH_TOKENS_FAILED") {
				return err("TOKEN_EXCHANGE_FAILED");
			}
		}

		const getIdentityResult = await this.oauthProviderGateway.getIdentity(tokensResult);

		await this.oauthProviderGateway.revokeToken(tokensResult);

		if (isErr(getIdentityResult)) {
			if (
				getIdentityResult.code === "ACCESS_TOKEN_INVALID" ||
				getIdentityResult.code === "IDENTITY_INVALID" ||
				getIdentityResult.code === "FETCH_IDENTITY_FAILED"
			) {
				return err("GET_IDENTITY_FAILED", { redirectURL: redirectToClientURL });
			}
		}

		const identity = getIdentityResult;

		const providerUserId = newExternalIdentityProviderUserId(identity.id);

		const [existingExternalIdentity, currentUserExternalIdentity] = await Promise.all([
			this.externalIdentityRepository.findByProviderAndProviderUserId(provider, providerUserId),
			this.externalIdentityRepository.findByUserIdAndProvider(userId, provider),
		]);

		if (currentUserExternalIdentity) {
			return err("PROVIDER_ALREADY_LINKED", { redirectURL: redirectToClientURL });
		}

		if (existingExternalIdentity) {
			return err("ACCOUNT_LINKED_ELSEWHERE", { redirectURL: redirectToClientURL });
		}

		const externalIdentity = createExternalIdentity({
			provider,
			providerUserId,
			userId,
		});

		await this.externalIdentityRepository.save(externalIdentity);

		return {
			redirectURL: redirectToClientURL,
			clientType,
		};
	}
}
