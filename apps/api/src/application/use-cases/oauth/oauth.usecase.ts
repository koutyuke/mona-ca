import type { IOAuthProviderGateway } from "@/interface-adapter/gateway/oauth-provider";
import type { AccountInfo } from "@/interface-adapter/gateway/oauth-provider/interface/oauth-provider.gateway.interface";
import { type OAuth2Tokens, generateCodeVerifier, generateState } from "arctic";
import type { IOAuthUseCase } from "./interface/oauth.usecase.interface";

export class OAuthUseCase implements IOAuthUseCase {
	constructor(private provider: IOAuthProviderGateway) {}

	public genAuthUrl(state: string, codeVerifier: string): URL {
		return this.provider.genAuthUrl(state, codeVerifier);
	}

	public async getTokens(code: string, codeVerifier: string): Promise<OAuth2Tokens> {
		return await this.provider.getTokens(code, codeVerifier);
	}

	public async getAccountInfo(accessToken: string): Promise<AccountInfo | null> {
		return await this.provider.getAccountInfo(accessToken);
	}

	public genState(): string {
		return generateState();
	}

	public genCodeVerifier(): string {
		return generateCodeVerifier();
	}
}
