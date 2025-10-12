import { getMobileScheme, getWebBaseURL, validateRedirectURL } from "@mona-ca/core/utils";
import { generateCodeVerifier } from "arctic";
import { err } from "../../../common/utils";
import type { ClientType } from "../../../domain/value-object";
import type { IOAuthRequestUseCase, OAuthRequestUseCaseResult } from "../../ports/in";
import type { IOAuthProviderGateway } from "../../ports/out/gateways";
import type { IOAuthStateSigner } from "../../ports/out/system";
import type { oauthStateSchema } from "./schema";

export class OAuthRequestUseCase implements IOAuthRequestUseCase {
	constructor(
		private readonly oauthProviderGateway: IOAuthProviderGateway,
		private readonly oauthStateSigner: IOAuthStateSigner<typeof oauthStateSchema>,
	) {}

	public execute(production: boolean, clientType: ClientType, queryRedirectURI: string): OAuthRequestUseCaseResult {
		const clientBaseURL = clientType === "web" ? getWebBaseURL(production) : getMobileScheme();

		const redirectToClientURL = validateRedirectURL(clientBaseURL, queryRedirectURI ?? "/");

		if (!redirectToClientURL) {
			return err("INVALID_REDIRECT_URL");
		}

		const state = this.oauthStateSigner.generate({ client: clientType });
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
