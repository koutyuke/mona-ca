import type { OAuthProvider } from "../../../../domain/entities/oauth-account";
import type { Session } from "../../../../domain/entities/session";

export interface IOAuthLoginCallbackUseCaseResult {
	session: Session;
	sessionToken: string;
}

export interface IOAuthLoginCallbackUseCase {
	execute(provider: OAuthProvider, code: string, codeVerifier: string): Promise<IOAuthLoginCallbackUseCaseResult>;
}
