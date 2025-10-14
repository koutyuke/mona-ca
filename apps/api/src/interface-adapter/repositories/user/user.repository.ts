import { eq } from "drizzle-orm";
import type { IUserRepository } from "../../../application/ports/out/repositories";
import type { User } from "../../../domain/entities";
import { type Gender, type SessionId, type UserId, newGender, newUserId } from "../../../domain/value-objects";
import type { DrizzleService } from "../../../infrastructure/drizzle";

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

interface UpdateUserDto {
	email: string;
	emailVerified: boolean;
	name: string;
	iconUrl: string | null;
	gender: Gender;
	passwordHash?: string | null;
	updatedAt: Date;
}

export class UserRepository implements IUserRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findById(id: UserId): Promise<User | null> {
		const users = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.users)
			.where(eq(this.drizzleService.schema.users.id, id));

		if (users.length > 1) {
			throw new Error("Multiple users found for the same id");
		}

		return users.length === 1 ? this.convertToUser(users[0]!) : null;
	}

	public async findByEmail(email: string): Promise<User | null> {
		const users = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.users)
			.where(eq(this.drizzleService.schema.users.email, email));

		if (users.length > 1) {
			throw new Error("Multiple users found for the same email");
		}
		return users.length === 1 ? this.convertToUser(users[0]!) : null;
	}

	public async findBySessionId(sessionId: SessionId): Promise<User | null> {
		const result = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.users)
			.innerJoin(
				this.drizzleService.schema.sessions,
				eq(this.drizzleService.schema.sessions.userId, this.drizzleService.schema.users.id),
			)
			.where(eq(this.drizzleService.schema.sessions.id, sessionId));

		if (result.length > 1) {
			throw new Error("Multiple users found for the same session");
		}

		return result.length === 1 ? this.convertToUser(result[0]!.users) : null;
	}

	public async findPasswordHashById(id: UserId): Promise<string | null> {
		const passwordHashes = await this.drizzleService.db
			.select({
				passwordHash: this.drizzleService.schema.users.passwordHash,
			})
			.from(this.drizzleService.schema.users)
			.where(eq(this.drizzleService.schema.users.id, id));

		if (passwordHashes.length > 1) {
			throw new Error("Multiple password hashes found for the same user");
		}

		return passwordHashes.length === 1 ? passwordHashes[0]!.passwordHash : null;
	}

	public async save(
		user: User,
		options?: {
			passwordHash?: string | null;
		},
	): Promise<void> {
		const updateUserDto: UpdateUserDto = {
			email: user.email,
			emailVerified: user.emailVerified,
			name: user.name,
			iconUrl: user.iconUrl,
			gender: user.gender,
			updatedAt: user.updatedAt,
		};

		const { passwordHash } = options ?? {};

		if (passwordHash !== undefined) {
			updateUserDto.passwordHash = passwordHash;
		}

		await this.drizzleService.db
			.insert(this.drizzleService.schema.users)
			.values({
				...user,
				passwordHash: passwordHash ?? null,
			})
			.onConflictDoUpdate({
				target: this.drizzleService.schema.users.id,
				set: updateUserDto,
			});
	}

	public async deleteById(id: UserId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.users)
			.where(eq(this.drizzleService.schema.users.id, id));
	}

	private convertToUser(dto: FoundUserDto): User {
		return {
			id: newUserId(dto.id),
			email: dto.email,
			name: dto.name,
			emailVerified: dto.emailVerified,
			iconUrl: dto.iconUrl,
			gender: newGender(dto.gender),
			createdAt: dto.createdAt,
			updatedAt: dto.updatedAt,
		} satisfies User;
	}
}
