import type { UserId } from "../../../../../../core/domain/value-objects";
import type { UserCredentials } from "../../../../domain/entities/user-credentials";
import type { UserRegistration } from "../../../../domain/entities/user-registration";
import type { SessionId } from "../../../../domain/value-objects/ids";

export interface IAuthUserRepository {
	findById(id: UserId): Promise<UserCredentials | null>;
	findByEmail(email: string): Promise<UserCredentials | null>;
	findBySessionId(sessionId: SessionId): Promise<UserCredentials | null>;

	create(registration: UserRegistration): Promise<void>;

	update(credentials: UserCredentials): Promise<void>;
}
