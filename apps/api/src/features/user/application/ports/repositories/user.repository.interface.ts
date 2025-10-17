import type { SessionId, UserId } from "../../../../common/domain/value-objects";
import type { User } from "../../../../domain/entities";

export interface IUserRepository {
	// search for a user by id
	findById(id: UserId): Promise<User | null>;

	// search for a user by email
	findByEmail(email: string): Promise<User | null>;

	// search for a user by session id
	findBySessionId(sessionId: SessionId): Promise<User | null>;

	// search for a user hashed password by user id
	findPasswordHashById(userId: UserId): Promise<string | null>;

	// create or update a user
	save(
		user: User,
		options?: {
			passwordHash?: string | null;
		},
	): Promise<void>;

	// delete a user
	deleteById(id: UserId): Promise<void>;
}
