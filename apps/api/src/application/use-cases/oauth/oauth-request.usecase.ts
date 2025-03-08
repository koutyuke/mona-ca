import { validateRedirectUrl } from "@mona-ca/core/utils";
import { generateCodeVerifier, generateState } from "arctic";
import { err } from "../../../common/utils";
import type { IOAuthProviderGateway } from "../../../interface-adapter/gateway/oauth-provider";
import type { IOAuthRequestUseCase, OAuthRequestUseCaseResult } from "./interfaces/oauth-request.usecase.interface";

export class OAuthRequestUseCase implements IOAuthRequestUseCase {
	constructor(private oauthProviderGateway: IOAuthProviderGateway) {}

	public execute(clientBaseUrl: URL, queryRedirectUrl: string): OAuthRequestUseCaseResult {
		const validatedRedirectUrl = validateRedirectUrl(clientBaseUrl, queryRedirectUrl ?? "/");

		if (!validatedRedirectUrl) {
			return err("INVALID_REDIRECT_URL");
		}

		const state = generateState();
		const codeVerifier = generateCodeVerifier();
		const redirectToProvider = this.oauthProviderGateway.genAuthUrl(state, codeVerifier);

		return {
			state,
			codeVerifier,
			redirectToClientUrl: validatedRedirectUrl,
			redirectToProviderUrl: redirectToProvider,
		};
	}
}
