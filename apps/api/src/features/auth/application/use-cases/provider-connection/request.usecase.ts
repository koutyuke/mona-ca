import { getMobileScheme, getWebBaseURL, validateRedirectURL } from "@mona-ca/core/http";
import { err, ok } from "@mona-ca/core/result";
import { generateCodeVerifier } from "arctic";

import type { ClientPlatform } from "../../../../../core/domain/value-objects";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { IdentityProviders } from "../../../domain/value-objects/identity-providers";
import type {
	IProviderConnectionRequestUseCase,
	ProviderConnectionRequestUseCaseResult,
} from "../../contracts/provider-connection/request.usecase.interface";
import type { IIdentityProviderGateway } from "../../ports/gateways/identity-provider.gateway.interface";
import type { IHmacOAuthStateService } from "../../ports/infra/hmac-oauth-state.service.interface";
import type { providerConnectionStateSchema } from "./schema";

export class ProviderConnectionRequestUseCase implements IProviderConnectionRequestUseCase {
	constructor(
		// gateways
		private readonly googleIdentityProviderGateway: IIdentityProviderGateway,
		private readonly discordIdentityProviderGateway: IIdentityProviderGateway,
		// infra
		private readonly providerConnectionOAuthStateService: IHmacOAuthStateService<typeof providerConnectionStateSchema>,
	) {}

	public async execute(
		production: boolean,
		clientPlatform: ClientPlatform,
		provider: IdentityProviders,
		queryRedirectURI: string,
		userCredentials: UserCredentials,
	): Promise<ProviderConnectionRequestUseCaseResult> {
		const clientBaseURL = clientPlatform === "web" ? getWebBaseURL(production) : getMobileScheme(production);
		const identityProviderGateway =
			provider === "google" ? this.googleIdentityProviderGateway : this.discordIdentityProviderGateway;

		const redirectToClientURL = validateRedirectURL(clientBaseURL, queryRedirectURI ?? "/");

		if (!redirectToClientURL) {
			return err("INVALID_REDIRECT_URI");
		}

		const state = this.providerConnectionOAuthStateService.generate({
			client: clientPlatform,
			uid: userCredentials.id,
		});
		const codeVerifier = generateCodeVerifier();
		const redirectToProviderURL = identityProviderGateway.createAuthorizationURL(state, codeVerifier);

		return ok({
			state,
			codeVerifier,
			redirectToClientURL,
			redirectToProviderURL,
		});
	}
}
