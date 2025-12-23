import type { Ok, Result } from "@mona-ca/core/result";
import type { AccountLinkRequest } from "../../../../domain/entities/account-link-request";
import type { AccountLinkRequestToken } from "../../../../domain/value-objects/tokens";

type Success = Ok<{
	accountLinkRequest: AccountLinkRequest;
	accountLinkRequestToken: AccountLinkRequestToken;
}>;

export type AccountLinkReissueUseCaseResult = Result<Success>;

export interface IAccountLinkReissueUseCase {
	execute(oldAccountLinkRequest: AccountLinkRequest): Promise<AccountLinkReissueUseCaseResult>;
}
