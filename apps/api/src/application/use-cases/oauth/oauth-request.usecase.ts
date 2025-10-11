import { getMobileScheme, getWebBaseURL, validateRedirectURL } from "@mona-ca/core/utils";
import { generateCodeVerifier } from "arctic";
import { err } from "../../../common/utils";
import type { ClientType } from "../../../domain/value-object";
import { type IOAuthProviderGateway, generateSignedState } from "../../../interface-adapter/gateway/oauth-provider";
import type { AppEnv } from "../../../modules/env";
import type { IOAuthRequestUseCase, OAuthRequestUseCaseResult } from "../../ports/in";
import type { oauthStateSchema } from "./schema";

export class OAuthRequestUseCase implements IOAuthRequestUseCase {
	constructor(
		private readonly env: {
			APP_ENV: AppEnv["APP_ENV"];
			OAUTH_STATE_HMAC_SECRET: AppEnv["OAUTH_STATE_HMAC_SECRET"];
		},
		private readonly oauthProviderGateway: IOAuthProviderGateway,
	) {}

	public execute(clientType: ClientType, queryRedirectURI: string): OAuthRequestUseCaseResult {
		const clientBaseURL = clientType === "web" ? getWebBaseURL(this.env.APP_ENV === "production") : getMobileScheme();

		const redirectToClientURL = validateRedirectURL(clientBaseURL, queryRedirectURI ?? "/");

		if (!redirectToClientURL) {
			return err("INVALID_REDIRECT_URL");
		}

		const state = generateSignedState<typeof oauthStateSchema.static>(
			{ client: clientType },
			this.env.OAUTH_STATE_HMAC_SECRET,
		);
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
