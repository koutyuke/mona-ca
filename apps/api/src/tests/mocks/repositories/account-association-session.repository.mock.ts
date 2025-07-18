import type { AccountAssociationSession } from "../../../domain/entities";
import { isExpiredAccountAssociationSession } from "../../../domain/entities";
import type { AccountAssociationSessionId, UserId } from "../../../domain/value-object";
import type { IAccountAssociationSessionRepository } from "../../../interface-adapter/repositories/account-association-session/interfaces/account-association-session.repository.interface";

export class AccountAssociationSessionRepositoryMock implements IAccountAssociationSessionRepository {
	public accountAssociationSessionMap: Map<AccountAssociationSessionId, AccountAssociationSession>;

	constructor(maps: {
		accountAssociationSessionMap: Map<AccountAssociationSessionId, AccountAssociationSession>;
	}) {
		this.accountAssociationSessionMap = maps.accountAssociationSessionMap;
	}

	async findById(id: AccountAssociationSessionId): Promise<AccountAssociationSession | null> {
		return this.accountAssociationSessionMap.get(id) || null;
	}

	async save(session: AccountAssociationSession): Promise<void> {
		this.accountAssociationSessionMap.set(session.id, session);
	}

	async deleteById(id: AccountAssociationSessionId): Promise<void> {
		this.accountAssociationSessionMap.delete(id);
	}

	async deleteByUserId(userId: UserId): Promise<void> {
		for (const [sessionId, session] of this.accountAssociationSessionMap.entries()) {
			if (session.userId === userId) {
				this.accountAssociationSessionMap.delete(sessionId);
			}
		}
	}

	async deleteExpiredSessions(): Promise<void> {
		for (const [sessionId, session] of this.accountAssociationSessionMap.entries()) {
			if (isExpiredAccountAssociationSession(session)) {
				this.accountAssociationSessionMap.delete(sessionId);
			}
		}
	}
}
