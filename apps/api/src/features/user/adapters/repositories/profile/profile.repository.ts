import { eq } from "drizzle-orm";
import { type Gender, type UserId, newGender, newUserId } from "../../../../../shared/domain/value-objects";
import type { DrizzleService } from "../../../../../shared/infra/drizzle";
import type { IProfileRepository } from "../../../application/ports/repositories/profile.repository.interface";
import type { Profile } from "../../../domain/entities/profile";

interface FoundUserDto {
	id: string;
	email: string;
	name: string;
	emailVerified: boolean;
	iconUrl: string | null;
	gender: "man" | "woman";
	passwordHash: string | null;
	createdAt: Date;
	updatedAt: Date;
}

interface UpdateProfileDto {
	name: string;
	iconUrl: string | null;
	gender: Gender;
	updatedAt: Date;
}

export class ProfileRepository implements IProfileRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findById(id: UserId): Promise<Profile | null> {
		const users = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.users)
			.where(eq(this.drizzleService.schema.users.id, id));

		if (users.length > 1) {
			throw new Error("Multiple users found for the same id");
		}

		return users.length === 1 ? this.convertToProfile(users[0]!) : null;
	}

	public async save(profile: Profile): Promise<void> {
		const updateUserDto: UpdateProfileDto = {
			name: profile.name,
			iconUrl: profile.iconUrl,
			gender: profile.gender,
			updatedAt: profile.updatedAt,
		};

		await this.drizzleService.db
			.update(this.drizzleService.schema.users)
			.set(updateUserDto)
			.where(eq(this.drizzleService.schema.users.id, profile.id));
	}

	private convertToProfile(dto: FoundUserDto): Profile {
		return {
			id: newUserId(dto.id),
			email: dto.email,
			name: dto.name,
			emailVerified: dto.emailVerified,
			iconUrl: dto.iconUrl,
			gender: newGender(dto.gender),
			createdAt: dto.createdAt,
			updatedAt: dto.updatedAt,
		} satisfies Profile;
	}
}
