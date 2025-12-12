import type { UserId } from "../../../../../core/domain/value-objects";
import type { ProviderLinkRequest } from "../../../domain/entities/provider-link-request";
import type { ProviderLinkRequestId } from "../../../domain/value-objects/ids";

export interface IProviderLinkRequestRepository {
	findById(id: ProviderLinkRequestId): Promise<ProviderLinkRequest | null>;

	save(request: ProviderLinkRequest): Promise<void>;

	deleteById(id: ProviderLinkRequestId): Promise<void>;

	deleteByUserId(userId: UserId): Promise<void>;

	deleteExpiredRequests(): Promise<void>;
}
