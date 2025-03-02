import type { Err, Result } from "../../../../common/utils";
import type { OAuthProvider, Session } from "../../../../domain/entities";

export type OAuthLoginCallbackUseCaseSuccessResult = {
	session: Session;
	sessionToken: string;
};

export type OAuthLoginCallbackUseCaseErrorResult =
	| Err<"FAILED_TO_GET_ACCOUNT_INFO">
	| Err<"OAUTH_ACCOUNT_NOT_FOUND">
	| Err<"OAUTH_ACCOUNT_NOT_FOUND_BUT_LINKABLE">;

export type OAuthLoginCallbackUseCaseResult = Result<
	OAuthLoginCallbackUseCaseSuccessResult,
	OAuthLoginCallbackUseCaseErrorResult
>;
export interface IOAuthLoginCallbackUseCase {
	execute(provider: OAuthProvider, code: string, codeVerifier: string): Promise<OAuthLoginCallbackUseCaseResult>;
}
