import type { OAuthProvider } from "@/domain/oauth-account/provider";
import type { Session } from "@/domain/session";

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
