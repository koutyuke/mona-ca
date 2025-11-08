import type { UserId } from "../../../../../core/domain/value-objects";
import type { IAccountLinkSessionRepository } from "../../../application/ports/repositories/account-link-session.repository.interface";
import { type AccountLinkSession, isExpiredAccountLinkSession } from "../../../domain/entities/account-link-session";
import type { AccountLinkSessionId } from "../../../domain/value-objects/ids";

export class AccountLinkSessionRepositoryMock implements IAccountLinkSessionRepository {
	private readonly accountLinkSessionMap: Map<AccountLinkSessionId, AccountLinkSession>;

	constructor(maps: { accountLinkSessionMap: Map<AccountLinkSessionId, AccountLinkSession> }) {
		this.accountLinkSessionMap = maps.accountLinkSessionMap;
	}

	async findById(id: AccountLinkSessionId): Promise<AccountLinkSession | null> {
		return this.accountLinkSessionMap.get(id) || null;
	}

	async save(session: AccountLinkSession): Promise<void> {
		this.accountLinkSessionMap.set(session.id, session);
	}

	async deleteById(id: AccountLinkSessionId): Promise<void> {
		this.accountLinkSessionMap.delete(id);
	}

	async deleteByUserId(userId: UserId): Promise<void> {
		for (const [sessionId, session] of this.accountLinkSessionMap.entries()) {
			if (session.userId === userId) {
				this.accountLinkSessionMap.delete(sessionId);
			}
		}
	}

	async deleteExpiredSessions(): Promise<void> {
		for (const [sessionId, session] of this.accountLinkSessionMap.entries()) {
			if (isExpiredAccountLinkSession(session)) {
				this.accountLinkSessionMap.delete(sessionId);
			}
		}
	}
}
