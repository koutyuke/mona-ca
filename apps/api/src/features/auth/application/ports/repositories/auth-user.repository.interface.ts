import type { UserId } from "../../../../../core/domain/value-objects";
import type { UserIdentity } from "../../../domain/entities/user-identity";
import type { UserRegistration } from "../../../domain/entities/user-registration";
import type { SessionId } from "../../../domain/value-objects/ids";

export interface IAuthUserRepository {
	findById(id: UserId): Promise<UserIdentity | null>;
	findByEmail(email: string): Promise<UserIdentity | null>;
	findBySessionId(sessionId: SessionId): Promise<UserIdentity | null>;

	create(registration: UserRegistration): Promise<void>;

	update(identity: UserIdentity): Promise<void>;
}
