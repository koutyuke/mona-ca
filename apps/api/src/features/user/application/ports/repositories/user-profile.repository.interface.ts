import type { UserId } from "../../../../../core/domain/value-objects";
import type { UserProfile } from "../../../domain/entities/user-profile";

export interface IUserProfileRepository {
	// search for a user by id
	findById(id: UserId): Promise<UserProfile | null>;

	// update user
	save(userProfile: UserProfile): Promise<void>;
}
