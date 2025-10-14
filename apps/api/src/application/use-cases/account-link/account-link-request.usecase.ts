import { err, getMobileScheme, getWebBaseURL, ok, validateRedirectURL } from "@mona-ca/core/utils";
import { generateCodeVerifier } from "arctic";
import type { ClientType } from "../../../domain/value-objects";
import type { UserId } from "../../../domain/value-objects";
import type { AccountLinkRequestUseCaseResult, IAccountLinkRequestUseCase } from "../../ports/in";
import type { IOAuthProviderGateway } from "../../ports/out/gateways";
import type { IOAuthStateSigner } from "../../ports/out/system";
import type { accountLinkStateSchema } from "./schema";

export class AccountLinkRequestUseCase implements IAccountLinkRequestUseCase {
	constructor(
		private readonly oauthProviderGateway: IOAuthProviderGateway,
		private readonly oauthStateSigner: IOAuthStateSigner<typeof accountLinkStateSchema>,
	) {}

	public execute(
		production: boolean,
		clientType: ClientType,
		queryRedirectURI: string,
		userId: UserId,
	): AccountLinkRequestUseCaseResult {
		const clientBaseURL = clientType === "web" ? getWebBaseURL(production) : getMobileScheme();

		const redirectToClientURL = validateRedirectURL(clientBaseURL, queryRedirectURI ?? "/");

		if (!redirectToClientURL) {
			return err("INVALID_REDIRECT_URI");
		}

		const state = this.oauthStateSigner.generate({ client: clientType, uid: userId });
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
