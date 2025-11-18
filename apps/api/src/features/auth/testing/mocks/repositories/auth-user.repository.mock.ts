import type { UserId } from "../../../../../core/domain/value-objects";
import type { IAuthUserRepository } from "../../../application/ports/repositories/auth-user.repository.interface";
import type { Session } from "../../../domain/entities/session";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { UserRegistration } from "../../../domain/entities/user-registration";
import type { SessionId } from "../../../domain/value-objects/ids";

export class AuthUserRepositoryMock implements IAuthUserRepository {
	private readonly authUserMap: Map<UserId, UserRegistration>;
	private readonly sessionMap: Map<SessionId, Session>;

	constructor(maps: {
		authUserMap: Map<UserId, UserRegistration>;
		sessionMap: Map<SessionId, Session>;
	}) {
		this.authUserMap = maps.authUserMap;
		this.sessionMap = maps.sessionMap;
	}

	async findById(id: UserId): Promise<UserCredentials | null> {
		const userRegistration = this.authUserMap.get(id);
		if (!userRegistration) {
			return null;
		}
		return this.refillUserIdentity(userRegistration);
	}

	async findByEmail(email: string): Promise<UserCredentials | null> {
		const userRegistration = this.authUserMap.values().find(userRegistration => userRegistration.email === email);
		if (!userRegistration) {
			return null;
		}
		return this.refillUserIdentity(userRegistration);
	}

	async findBySessionId(sessionId: SessionId): Promise<UserCredentials | null> {
		const session = this.sessionMap.get(sessionId);
		if (!session) {
			return null;
		}
		const userRegistration = this.authUserMap.get(session.userId);
		if (!userRegistration) {
			return null;
		}
		return this.refillUserIdentity(userRegistration);
	}

	async create(registration: UserRegistration): Promise<void> {
		this.authUserMap.set(registration.id, registration);
	}

	async update(identity: UserCredentials): Promise<void> {
		const userRegistration = this.authUserMap.get(identity.id);
		if (!userRegistration) {
			return;
		}
		this.authUserMap.set(identity.id, {
			...userRegistration,
			email: identity.email,
			emailVerified: identity.emailVerified,
			passwordHash: identity.passwordHash,
		});
	}

	private refillUserIdentity(userRegistration: UserRegistration): UserCredentials {
		return {
			id: userRegistration.id,
			email: userRegistration.email,
			emailVerified: userRegistration.emailVerified,
			passwordHash: userRegistration.passwordHash,
			createdAt: userRegistration.createdAt,
			updatedAt: userRegistration.updatedAt,
		};
	}
}
