import { isExpiredProviderLinkRequest } from "../../../domain/entities/provider-link-request";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { IProviderLinkRequestRepository } from "../../../application/ports/out/repositories/provider-link-request.repository.interface";
import type { ProviderLinkRequest } from "../../../domain/entities/provider-link-request";
import type { ProviderLinkRequestId } from "../../../domain/value-objects/ids";

export class ProviderLinkRequestRepositoryMock implements IProviderLinkRequestRepository {
	private readonly providerLinkRequestMap: Map<ProviderLinkRequestId, ProviderLinkRequest>;

	constructor(maps: { providerLinkRequestMap: Map<ProviderLinkRequestId, ProviderLinkRequest> }) {
		this.providerLinkRequestMap = maps.providerLinkRequestMap;
	}

	async findById(id: ProviderLinkRequestId): Promise<ProviderLinkRequest | null> {
		return this.providerLinkRequestMap.get(id) || null;
	}

	async save(request: ProviderLinkRequest): Promise<void> {
		this.providerLinkRequestMap.set(request.id, request);
	}

	async deleteById(id: ProviderLinkRequestId): Promise<void> {
		this.providerLinkRequestMap.delete(id);
	}

	async deleteByUserId(userId: UserId): Promise<void> {
		for (const [requestId, request] of this.providerLinkRequestMap.entries()) {
			if (request.userId === userId) {
				this.providerLinkRequestMap.delete(requestId);
			}
		}
	}

	async deleteExpiredRequests(): Promise<void> {
		for (const [requestId, request] of this.providerLinkRequestMap.entries()) {
			if (isExpiredProviderLinkRequest(request)) {
				this.providerLinkRequestMap.delete(requestId);
			}
		}
	}
}
