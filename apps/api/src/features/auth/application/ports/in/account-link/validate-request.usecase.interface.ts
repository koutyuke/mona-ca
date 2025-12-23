import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { AccountLinkRequest } from "../../../../domain/entities/account-link-request";
import type { UserCredentials } from "../../../../domain/entities/user-credentials";
import type { AccountLinkRequestToken } from "../../../../domain/value-objects/tokens";

type Success = Ok<{
	accountLinkRequest: AccountLinkRequest;
	userCredentials: UserCredentials;
}>;

type Error = Err<"INVALID_ACCOUNT_LINK_REQUEST"> | Err<"EXPIRED_ACCOUNT_LINK_REQUEST">;

export type AccountLinkValidateRequestUseCaseResult = Result<Success, Error>;

export interface IAccountLinkValidateRequestUseCase {
	execute(accountLinkRequestToken: AccountLinkRequestToken): Promise<AccountLinkValidateRequestUseCaseResult>;
}
