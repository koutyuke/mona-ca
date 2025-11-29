import type { Ok, Result } from "@mona-ca/core/utils";
import type { AccountLinkSession } from "../../../domain/entities/account-link-session";
import type { AccountLinkSessionToken } from "../../../domain/value-objects/tokens";

type Success = Ok<{
	accountLinkSession: AccountLinkSession;
	accountLinkSessionToken: AccountLinkSessionToken;
}>;

export type AccountLinkReissueSessionUseCaseResult = Result<Success>;

export interface IAccountLinkReissueSessionUseCase {
	execute(oldAccountLinkSession: AccountLinkSession): Promise<AccountLinkReissueSessionUseCaseResult>;
}
