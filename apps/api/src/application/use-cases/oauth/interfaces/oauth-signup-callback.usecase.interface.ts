import type { OAuthProvider } from "../../../../domain/entities/oauth-account";
import type { Session } from "../../../../domain/entities/session";

export interface IOAuthSignupCallbackUseCaseResult {
	session: Session;
	sessionToken: string;
}

export interface IOAuthSignupCallbackUseCase {
	execute(
		code: string,
		codeVerifier: string,
		provider: OAuthProvider,
		userOption?: {
			gender?: "man" | "woman";
		},
	): Promise<IOAuthSignupCallbackUseCaseResult>;
}
