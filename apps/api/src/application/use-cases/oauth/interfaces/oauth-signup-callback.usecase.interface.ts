import type { Err, Result } from "../../../../common/utils";
import type { OAuthProvider, Session } from "../../../../domain/entities";

export type OAuthSignupCallbackUseCaseSuccessResult = {
	session: Session;
	sessionToken: string;
};

export type OAuthSignupCallbackUseCaseErrorResult =
	| Err<"FAILED_TO_GET_ACCOUNT_INFO">
	| Err<"ACCOUNT_IS_ALREADY_USED">
	| Err<"EMAIL_ALREADY_EXISTS_BUT_LINKABLE">;

export type OAuthSignupCallbackUseCaseResult = Result<
	OAuthSignupCallbackUseCaseSuccessResult,
	OAuthSignupCallbackUseCaseErrorResult
>;

export interface IOAuthSignupCallbackUseCase {
	execute(
		code: string,
		codeVerifier: string,
		provider: OAuthProvider,
		userOption?: {
			gender?: "man" | "woman";
		},
	): Promise<OAuthSignupCallbackUseCaseResult>;
}
