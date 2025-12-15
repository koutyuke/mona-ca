import { eq } from "drizzle-orm";
import { type Gender, type UserId, newGender, newUserId } from "../../../../../core/domain/value-objects";
import type { DrizzleService } from "../../../../../core/infra/drizzle";
import type { IUserProfileRepository } from "../../../application/ports/out/repositories/user-profile.repository.interface";
import type { UserProfile } from "../../../domain/entities/user-profile";

interface FoundUserDto {
	id: string;
	email: string;
	name: string;
	emailVerified: boolean;
	iconUrl: string | null;
	gender: "male" | "female";
	passwordHash: string | null;
	createdAt: Date;
	updatedAt: Date;
}

interface UpdateUserProfileDto {
	name: string;
	iconUrl: string | null;
	gender: Gender;
	updatedAt: Date;
}

export class UserProfileRepository implements IUserProfileRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findById(id: UserId): Promise<UserProfile | null> {
		const users = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.usersTable)
			.where(eq(this.drizzleService.schema.usersTable.id, id));

		if (users.length > 1) {
			throw new Error("Multiple users found for the same id");
		}

		return users.length === 1 ? this.convertToUserProfile(users[0]!) : null;
	}

	public async save(userProfile: UserProfile): Promise<void> {
		const updateUserDto: UpdateUserProfileDto = {
			name: userProfile.name,
			iconUrl: userProfile.iconUrl,
			gender: userProfile.gender,
			updatedAt: userProfile.updatedAt,
		};

		await this.drizzleService.db
			.update(this.drizzleService.schema.usersTable)
			.set(updateUserDto)
			.where(eq(this.drizzleService.schema.usersTable.id, userProfile.id));
	}

	private convertToUserProfile(dto: FoundUserDto): UserProfile {
		return {
			id: newUserId(dto.id),
			email: dto.email,
			name: dto.name,
			emailVerified: dto.emailVerified,
			iconUrl: dto.iconUrl,
			gender: newGender(dto.gender),
			createdAt: dto.createdAt,
			updatedAt: dto.updatedAt,
		} satisfies UserProfile;
	}
}
