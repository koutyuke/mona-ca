import type { UserId } from "../../../../../shared/domain/value-objects";
import type { IProfileRepository } from "../../../application/ports/repositories/profile.repository.interface";
import type { Profile } from "../../../domain/entities/profile";

export class ProfileRepositoryMock implements IProfileRepository {
	private readonly profileMap: Map<UserId, Profile>;

	constructor(maps: {
		profileMap: Map<UserId, Profile>;
	}) {
		this.profileMap = maps.profileMap;
	}

	async findById(id: UserId): Promise<Profile | null> {
		return this.profileMap.get(id) || null;
	}

	async save(profile: Profile): Promise<void> {
		this.profileMap.set(profile.id, profile);
	}
}
