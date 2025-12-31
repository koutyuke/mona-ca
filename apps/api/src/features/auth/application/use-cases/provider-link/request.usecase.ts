import { getMobileScheme, getWebBaseURL, validateRedirectURL } from "@mona-ca/core/http";
import { err, ok } from "@mona-ca/core/result";
import { generateCodeVerifier } from "arctic";
import { match } from "ts-pattern";
import { isMobilePlatform, isWebPlatform } from "../../../../../core/domain/value-objects";
import { isDiscordProvider, isGoogleProvider } from "../../../domain/value-objects/identity-providers";

import type { ClientPlatform } from "../../../../../core/domain/value-objects";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { IdentityProviders } from "../../../domain/value-objects/identity-providers";
import type {
	IProviderLinkRequestUseCase,
	ProviderLinkRequestUseCaseResult,
} from "../../ports/in/provider-link/request.usecase.interface";
import type { IIdentityProviderGateway } from "../../ports/out/gateways/identity-provider.gateway.interface";
import type { IHmacSignedStateService } from "../../ports/out/infra/hmac-signed-state.service.interface";
import type { providerLinkStateSchema } from "./schema";

export class ProviderLinkRequestUseCase implements IProviderLinkRequestUseCase {
	constructor(
		// gateways
		private readonly discordIdentityProviderGateway: IIdentityProviderGateway,
		private readonly googleIdentityProviderGateway: IIdentityProviderGateway,
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
		const clientBaseURL = match(clientPlatform)
			.when(isWebPlatform, () => getWebBaseURL(production))
			.when(isMobilePlatform, () => getMobileScheme(production))
			.exhaustive();

		const identityProviderGateway = match(provider)
			.when(isGoogleProvider, () => this.googleIdentityProviderGateway)
			.when(isDiscordProvider, () => this.discordIdentityProviderGateway)
			.exhaustive();

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
