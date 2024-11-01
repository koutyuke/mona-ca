import type { AccountInfo } from "@/interface-adapter/gateway/oauth-provider";
import type { OAuth2Tokens } from "arctic";

export interface IOAuthUseCase {
	genAuthUrl(state: string, codeVerifier: string): URL;
	getTokens(code: string, codeVerifier: string): Promise<OAuth2Tokens>;
	getAccountInfo(accessToken: string): Promise<AccountInfo | null>;
	generateState(): string;
	generateCodeVerifier(): string;
}
