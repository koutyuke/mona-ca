import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { AccountLinkRequest } from "../../../../domain/entities/account-link-request";
import type { Session } from "../../../../domain/entities/session";
import type { UserCredentials } from "../../../../domain/entities/user-credentials";
import type { SessionToken } from "../../../../domain/value-objects/tokens";

type Success = Ok<{
	session: Session;
	sessionToken: SessionToken;
}>;

type Error = Err<"INVALID_CODE"> | Err<"PROVIDER_ALREADY_LINKED"> | Err<"ACCOUNT_LINKED_ELSEWHERE">;

export type AccountLinkVerifyEmailUseCaseResult = Result<Success, Error>;

export interface IAccountLinkVerifyEmailUseCase {
	execute(
		code: string,
		userCredentials: UserCredentials,
		accountLinkRequest: AccountLinkRequest,
	): Promise<AccountLinkVerifyEmailUseCaseResult>;
}
