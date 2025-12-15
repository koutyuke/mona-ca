import { getMobileScheme, getWebBaseURL, validateRedirectURL } from "@mona-ca/core/http";
import { err, ok } from "@mona-ca/core/result";
import { generateCodeVerifier } from "arctic";

import type { ClientPlatform } from "../../../../../core/domain/value-objects";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { IdentityProviders } from "../../../domain/value-objects/identity-providers";
import type {
	IProviderLinkRequestUseCase,
	ProviderLinkRequestUseCaseResult,
} from "../../contracts/provider-link/request.usecase.interface";
import type { IIdentityProviderGateway } from "../../ports/gateways/identity-provider.gateway.interface";
import type { IHmacSignedStateService } from "../../ports/infra/hmac-signed-state.service.interface";
import type { providerLinkStateSchema } from "./schema";

export class ProviderLinkRequestUseCase implements IProviderLinkRequestUseCase {
	constructor(
		// gateways
		private readonly googleIdentityProviderGateway: IIdentityProviderGateway,
		private readonly discordIdentityProviderGateway: IIdentityProviderGateway,
		// infra
		private readonly providerLinkSignedStateService: IHmacSignedStateService<typeof providerLinkStateSchema>,
	) {}

	public async execute(
		production: boolean,
		clientPlatform: ClientPlatform,
		provider: IdentityProviders,
		queryRedirectURI: string,
		userCredentials: UserCredentials,
	): Promise<ProviderLinkRequestUseCaseResult> {
		const clientBaseURL = clientPlatform === "web" ? getWebBaseURL(production) : getMobileScheme(production);
		const identityProviderGateway =
			provider === "google" ? this.googleIdentityProviderGateway : this.discordIdentityProviderGateway;

		const redirectToClientURL = validateRedirectURL(clientBaseURL, queryRedirectURI ?? "/");

		if (!redirectToClientURL) {
			return err("INVALID_REDIRECT_URI");
		}

		const state = this.providerLinkSignedStateService.sign({
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
