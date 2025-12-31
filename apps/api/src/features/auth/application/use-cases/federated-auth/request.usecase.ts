import { getMobileScheme, getWebBaseURL, validateRedirectURL } from "@mona-ca/core/http";
import { err, ok } from "@mona-ca/core/result";
import { generateCodeVerifier } from "arctic";
import { match } from "ts-pattern";
import { isMobilePlatform, isWebPlatform } from "../../../../../core/domain/value-objects";
import { isDiscordProvider, isGoogleProvider } from "../../../domain/value-objects/identity-providers";

import type { ClientPlatform } from "../../../../../core/domain/value-objects";
import type { IdentityProviders } from "../../../domain/value-objects/identity-providers";
import type {
	FederatedAuthRequestUseCaseResult,
	IFederatedAuthRequestUseCase,
} from "../../ports/in/federated-auth/request.usecase.interface";
import type { IIdentityProviderGateway } from "../../ports/out/gateways/identity-provider.gateway.interface";
import type { IHmacSignedStateService } from "../../ports/out/infra/hmac-signed-state.service.interface";
import type { federatedAuthStateSchema } from "./schema";

export class FederatedAuthRequestUseCase implements IFederatedAuthRequestUseCase {
	constructor(
		// gateways
		private readonly discordIdentityProviderGateway: IIdentityProviderGateway,
		private readonly googleIdentityProviderGateway: IIdentityProviderGateway,
		// infra
		private readonly federatedAuthSignedStateService: IHmacSignedStateService<typeof federatedAuthStateSchema>,
	) {}

	public execute(
		production: boolean,
		clientPlatform: ClientPlatform,
		provider: IdentityProviders,
		queryRedirectURI: string,
	): FederatedAuthRequestUseCaseResult {
		const identityProviderGateway = match(provider)
			.when(isGoogleProvider, () => this.googleIdentityProviderGateway)
			.when(isDiscordProvider, () => this.discordIdentityProviderGateway)
			.exhaustive();

		const clientBaseURL = match(clientPlatform)
			.when(isWebPlatform, () => getWebBaseURL(production))
			.when(isMobilePlatform, () => getMobileScheme(production))
			.exhaustive();

		const redirectToClientURL = validateRedirectURL(clientBaseURL, queryRedirectURI ?? "/");

		if (!redirectToClientURL) {
			return err("INVALID_REDIRECT_URI");
		}

		const state = this.federatedAuthSignedStateService.sign({ client: clientPlatform });
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
