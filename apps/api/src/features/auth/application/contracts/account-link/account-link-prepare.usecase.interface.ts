import type { Ok, Result } from "@mona-ca/core/utils";
import type { UserId } from "../../../../../core/domain/value-objects";
import type { AccountLinkSession } from "../../../domain/entities/account-link-session";
import type { AccountLinkSessionToken } from "../../../domain/value-objects/session-token";

type Success = Ok<{
	accountLinkSession: AccountLinkSession;
	accountLinkSessionToken: AccountLinkSessionToken;
}>;

export type AccountLinkPrepareUseCaseResult = Result<Success>;

export interface IAccountLinkPrepareUseCase {
	execute(userId: UserId): Promise<AccountLinkPrepareUseCaseResult>;
}
