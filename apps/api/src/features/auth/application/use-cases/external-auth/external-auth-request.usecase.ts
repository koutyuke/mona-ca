import { err, getMobileScheme, getWebBaseURL, ok, validateRedirectURL } from "@mona-ca/core/utils";
import { generateCodeVerifier } from "arctic";

import type { ClientType } from "../../../../../core/domain/value-objects";
import type { ExternalIdentityProvider } from "../../../domain/value-objects/external-identity";
import type {
	ExternalAuthRequestUseCaseResult,
	IExternalAuthRequestUseCase,
} from "../../contracts/external-auth/external-auth-request.usecase.interface";
import type { IOAuthProviderGateway } from "../../ports/gateways/oauth-provider.gateway.interface";
import type { IHmacOAuthStateSigner } from "../../ports/infra/hmac-oauth-state-signer.interface";
import type { oauthStateSchema } from "./schema";

export class ExternalAuthRequestUseCase implements IExternalAuthRequestUseCase {
	constructor(
		private readonly googleOAuthGateway: IOAuthProviderGateway,
		private readonly discordOAuthGateway: IOAuthProviderGateway,
		private readonly externalAuthOAuthStateSigner: IHmacOAuthStateSigner<typeof oauthStateSchema>,
	) {}

	public execute(
		production: boolean,
		clientType: ClientType,
		provider: ExternalIdentityProvider,
		queryRedirectURI: string,
	): ExternalAuthRequestUseCaseResult {
		const oauthProviderGateway = provider === "google" ? this.googleOAuthGateway : this.discordOAuthGateway;
		const clientBaseURL = clientType === "web" ? getWebBaseURL(production) : getMobileScheme();

		const redirectToClientURL = validateRedirectURL(clientBaseURL, queryRedirectURI ?? "/");

		if (!redirectToClientURL) {
			return err("INVALID_REDIRECT_URI");
		}

		const state = this.externalAuthOAuthStateSigner.generate({ client: clientType });
		const codeVerifier = generateCodeVerifier();
		const redirectToProviderURL = oauthProviderGateway.createAuthorizationURL(state, codeVerifier);

		return ok({
			state,
			codeVerifier,
			redirectToClientURL,
			redirectToProviderURL,
		});
	}
}
