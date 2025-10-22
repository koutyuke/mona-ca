import type { UserId } from "../../../../../core/domain/value-objects";
import type { Profile } from "../../../domain/entities/profile";

export interface IProfileRepository {
	// search for a user by id
	findById(id: UserId): Promise<Profile | null>;

	// update user
	save(profile: Profile): Promise<void>;
}
