import type { UserId } from "../../../../../../core/domain/value-objects";
import type { AccountLinkRequest } from "../../../../domain/entities/account-link-request";
import type { AccountLinkRequestId } from "../../../../domain/value-objects/ids";

export interface IAccountLinkRequestRepository {
	findById(id: AccountLinkRequestId): Promise<AccountLinkRequest | null>;

	save(request: AccountLinkRequest): Promise<void>;

	deleteById(id: AccountLinkRequestId): Promise<void>;

	deleteByUserId(userId: UserId): Promise<void>;

	deleteExpiredRequests(): Promise<void>;
}
