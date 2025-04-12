import { validateRedirectURL } from "@mona-ca/core/utils";
import { generateCodeVerifier } from "arctic";
import { err } from "../../../common/utils";
import type { ClientType } from "../../../domain/value-object";
import { type IOAuthProviderGateway, generateSignedState } from "../../../interface-adapter/gateway/oauth-provider";
import type { IOAuthRequestUseCase, OAuthRequestUseCaseResult } from "./interfaces/oauth-request.usecase.interface";

export class OAuthRequestUseCase implements IOAuthRequestUseCase {
	constructor(
		private readonly oauthProviderGateway: IOAuthProviderGateway,
		private readonly oauthStateHMACSecret: string,
	) {}

	public execute(clientType: ClientType, clientBaseURL: URL, queryRedirectURI: string): OAuthRequestUseCaseResult {
		const redirectToClientURL = validateRedirectURL(clientBaseURL, queryRedirectURI ?? "/");

		if (!redirectToClientURL) {
			return err("INVALID_REDIRECT_URL");
		}

		const state = generateSignedState({ clientType }, this.oauthStateHMACSecret);
		const codeVerifier = generateCodeVerifier();
		const redirectToProviderURL = this.oauthProviderGateway.genAuthURL(state, codeVerifier);

		return {
			state,
			codeVerifier,
			redirectToClientURL,
			redirectToProviderURL,
		};
	}
}
