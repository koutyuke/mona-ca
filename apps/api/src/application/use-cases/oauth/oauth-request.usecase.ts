import { validateRedirectUrl } from "@mona-ca/core/utils";
import { generateCodeVerifier, generateState } from "arctic";
import type { IOAuthProviderGateway } from "../../../interface-adapter/gateway/oauth-provider";
import type { IOAuthRequestUseCase, IOAuthRequestUseCaseResult } from "./interface/oauth-request.usecase.interface";

export class OAuthRequestUseCase implements IOAuthRequestUseCase {
	constructor(private oAuthProviderGateway: IOAuthProviderGateway) {}

	public execute(clientBaseUrl: URL, queryRedirectUrl: string): IOAuthRequestUseCaseResult {
		const validatedRedirectUrl = validateRedirectUrl(clientBaseUrl, queryRedirectUrl ?? "/");

		if (!validatedRedirectUrl) {
			throw new Error("Invalid redirect URL");
		}

		const state = generateState();
		const codeVerifier = generateCodeVerifier();
		const redirectToProvider = this.oAuthProviderGateway.genAuthUrl(state, codeVerifier);

		return {
			state,
			codeVerifier,
			redirectToClientUrl: validatedRedirectUrl,
			redirectToProviderUrl: redirectToProvider,
		};
	}
}
