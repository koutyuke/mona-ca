import { isExpiredAccountLinkRequest } from "../../../domain/entities/account-link-request";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { IAccountLinkRequestRepository } from "../../../application/ports/out/repositories/account-link-request.repository.interface";
import type { AccountLinkRequest } from "../../../domain/entities/account-link-request";
import type { AccountLinkRequestId } from "../../../domain/value-objects/ids";

export class AccountLinkRequestRepositoryMock implements IAccountLinkRequestRepository {
	private readonly accountLinkRequestMap: Map<AccountLinkRequestId, AccountLinkRequest>;

	constructor(maps: { accountLinkRequestMap: Map<AccountLinkRequestId, AccountLinkRequest> }) {
		this.accountLinkRequestMap = maps.accountLinkRequestMap;
	}

	async findById(id: AccountLinkRequestId): Promise<AccountLinkRequest | null> {
		return this.accountLinkRequestMap.get(id) || null;
	}

	async save(request: AccountLinkRequest): Promise<void> {
		this.accountLinkRequestMap.set(request.id, request);
	}

	async deleteById(id: AccountLinkRequestId): Promise<void> {
		this.accountLinkRequestMap.delete(id);
	}

	async deleteByUserId(userId: UserId): Promise<void> {
		for (const [requestId, request] of this.accountLinkRequestMap.entries()) {
			if (request.userId === userId) {
				this.accountLinkRequestMap.delete(requestId);
			}
		}
	}

	async deleteExpiredRequests(): Promise<void> {
		for (const [requestId, request] of this.accountLinkRequestMap.entries()) {
			if (isExpiredAccountLinkRequest(request)) {
				this.accountLinkRequestMap.delete(requestId);
			}
		}
	}
}
