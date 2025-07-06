import type { Session, User } from "../../../domain/entities";
import type { SessionId, UserId } from "../../../domain/value-object";
import type { IUserRepository } from "../../../interface-adapter/repositories/user/interfaces/user.repository.interface";

export class UserRepositoryMock implements IUserRepository {
	public userMap: Map<UserId, User>;
	public userPasswordHashMap: Map<UserId, string>;
	public sessionMap: Map<SessionId, Session>;

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
