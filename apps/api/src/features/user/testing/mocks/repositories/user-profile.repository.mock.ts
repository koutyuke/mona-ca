import type { UserId } from "../../../../../core/domain/value-objects";
import type { IUserProfileRepository } from "../../../application/ports/out/repositories/user-profile.repository.interface";
import type { UserProfile } from "../../../domain/entities/user-profile";

export class UserProfileRepositoryMock implements IUserProfileRepository {
	private readonly userProfileMap: Map<UserId, UserProfile>;

	constructor(maps: {
		userProfileMap: Map<UserId, UserProfile>;
	}) {
		this.userProfileMap = maps.userProfileMap;
	}

	async findById(id: UserId): Promise<UserProfile | null> {
		return this.userProfileMap.get(id) || null;
	}

	async save(userProfile: UserProfile): Promise<void> {
		this.userProfileMap.set(userProfile.id, userProfile);
	}
}
