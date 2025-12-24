import type { UserId } from "../../../../../core/domain/value-objects";
import type { UserProfile } from "../../../domain/entities/user-profile";

export const createUserProfileMap = (userProfiles: UserProfile[] = []): Map<UserId, UserProfile> => {
	return new Map(userProfiles.map(userProfile => [userProfile.id, userProfile]));
};
