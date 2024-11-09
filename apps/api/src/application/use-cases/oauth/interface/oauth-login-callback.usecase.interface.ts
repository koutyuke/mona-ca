import type { OAuthProvider } from "@/domain/oauth-account/provider";
import type { Session } from "@/domain/session";

export interface IOAuthLoginCallbackUseCaseResult {
	session: Session;
	sessionToken: string;
}

export interface IOAuthLoginCallbackUseCase {
	execute(provider: OAuthProvider, code: string, codeVerifier: string): Promise<IOAuthLoginCallbackUseCaseResult>;
}
