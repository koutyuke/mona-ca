import { err, getMobileScheme, getWebBaseURL, ok, validateRedirectURL } from "@mona-ca/core/utils";
import { generateCodeVerifier } from "arctic";
import type {
	ExternalAuthRequestUseCaseResult,
	IExternalAuthRequestUseCase,
} from "../../../../../application/ports/in";
import type { ClientType } from "../../../../../common/domain/value-objects";
import type { IOAuthProviderGateway } from "../../../../../common/ports/gateways";
import type { IOAuthStateSigner } from "../../../../../common/ports/system";
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
