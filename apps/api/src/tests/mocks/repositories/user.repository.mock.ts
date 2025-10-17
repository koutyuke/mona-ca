import type { IUserRepository } from "../../../application/ports/out/repositories";
import type { SessionId, UserId } from "../../../common/domain/value-objects";
import type { Session, User } from "../../../domain/entities";

export class UserRepositoryMock implements IUserRepository {
	private readonly userMap: Map<UserId, User>;
	private readonly userPasswordHashMap: Map<UserId, string>;
	private readonly sessionMap: Map<SessionId, Session>;

	constructor(maps: {
		userMap: Map<UserId, User>;
		userPasswordHashMap: Map<UserId, string>;
		sessionMap: Map<SessionId, Session>;
	}) {
		this.userMap = maps.userMap;
		this.userPasswordHashMap = maps.userPasswordHashMap;
		this.sessionMap = maps.sessionMap;
	}

	async findById(id: UserId): Promise<User | null> {
		return this.userMap.get(id) || null;
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.userMap.values().find(user => user.email === email) || null;
	}

	async findBySessionId(sessionId: SessionId): Promise<User | null> {
		const session = this.sessionMap.get(sessionId);
		if (!session) {
			return null;
		}
		return this.userMap.get(session.userId) || null;
	}

	async findPasswordHashById(userId: UserId): Promise<string | null> {
		return this.userPasswordHashMap.get(userId) || null;
	}

	async save(user: User, options?: { passwordHash?: string | null }): Promise<void> {
		this.userMap.set(user.id, user);

		if (options?.passwordHash) {
			this.userPasswordHashMap.set(user.id, options.passwordHash);
		}
	}

	async deleteById(id: UserId): Promise<void> {
		this.userMap.delete(id);
		this.userPasswordHashMap.delete(id);
	}
}
