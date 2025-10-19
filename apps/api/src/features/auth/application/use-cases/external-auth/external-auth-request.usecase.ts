import { err, getMobileScheme, getWebBaseURL, ok, validateRedirectURL } from "@mona-ca/core/utils";
import { generateCodeVerifier } from "arctic";

import type { ClientType } from "../../../../../shared/domain/value-objects";
import type { IOAuthStateSigner } from "../../../../../shared/ports/system";
import type {
	ExternalAuthRequestUseCaseResult,
	IExternalAuthRequestUseCase,
} from "../../contracts/external-auth/external-auth-request.usecase.interface";
import type { IOAuthProviderGateway } from "../../ports/gateways/oauth-provider.gateway.interface";
import type { oauthStateSchema } from "./schema";

export class ExternalAuthRequestUseCase implements IExternalAuthRequestUseCase {
	constructor(
		private readonly oauthProviderGateway: IOAuthProviderGateway,
		private readonly oauthStateSigner: IOAuthStateSigner<typeof oauthStateSchema>,
	) {}

	public execute(
		production: boolean,
		clientType: ClientType,
		queryRedirectURI: string,
	): ExternalAuthRequestUseCaseResult {
		const clientBaseURL = clientType === "web" ? getWebBaseURL(production) : getMobileScheme();

		const redirectToClientURL = validateRedirectURL(clientBaseURL, queryRedirectURI ?? "/");

		if (!redirectToClientURL) {
			return err("INVALID_REDIRECT_URI");
		}

		const state = this.oauthStateSigner.generate({ client: clientType });
		const codeVerifier = generateCodeVerifier();
		const redirectToProviderURL = this.oauthProviderGateway.createAuthorizationURL(state, codeVerifier);

		return ok({
			state,
			codeVerifier,
			redirectToClientURL,
			redirectToProviderURL,
		});
	}
}
