import type { UserId } from "../../../../../core/domain/value-objects";
import type { AccountLinkSession } from "../../../domain/entities/account-link-session";
import type { AccountLinkSessionId } from "../../../domain/value-objects/ids";

export interface IAccountLinkSessionRepository {
	findById(id: AccountLinkSessionId): Promise<AccountLinkSession | null>;

	save(session: AccountLinkSession): Promise<void>;

	deleteById(id: AccountLinkSessionId): Promise<void>;

	deleteByUserId(userId: UserId): Promise<void>;

	deleteExpiredSessions(): Promise<void>;
}
