import type { UserId } from "../../../../../shared/domain/value-objects";
import type { Profile } from "../../../domain/entities/profile";

export const createProfilesMap = (profiles: Profile[] = []): Map<UserId, Profile> => {
	return new Map(profiles.map(profile => [profile.id, profile]));
};
