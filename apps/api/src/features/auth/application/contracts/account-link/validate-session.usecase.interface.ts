import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { AccountLinkSession } from "../../../domain/entities/account-link-session";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { AccountLinkSessionToken } from "../../../domain/value-objects/tokens";

type Success = Ok<{
	accountLinkSession: AccountLinkSession;
	userCredentials: UserCredentials;
}>;

type Error = Err<"ACCOUNT_LINK_SESSION_INVALID"> | Err<"ACCOUNT_LINK_SESSION_EXPIRED">;

export type AccountLinkValidateSessionUseCaseResult = Result<Success, Error>;

export interface IAccountLinkValidateSessionUseCase {
	execute(accountLinkSessionToken: AccountLinkSessionToken): Promise<AccountLinkValidateSessionUseCaseResult>;
}
