import { eq } from "drizzle-orm";
import { type UserId, newUserId } from "../../../../../core/domain/value-objects";
import type { DrizzleService } from "../../../../../core/infra/drizzle";
import type { IAuthUserRepository } from "../../../application/ports/repositories/auth-user.repository.interface";
import type { UserIdentity } from "../../../domain/entities/user-identity";
import type { UserRegistration } from "../../../domain/entities/user-registration";
import type { SessionId } from "../../../domain/value-objects/ids";

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

export class AuthUserRepository implements IAuthUserRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findById(id: UserId): Promise<UserIdentity | null> {
		const users = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.users)
			.where(eq(this.drizzleService.schema.users.id, id));

		if (users.length > 1) {
			throw new Error("Multiple users found for the same id");
		}

		return users.length === 1 ? this.convertToUserIdentity(users[0]!) : null;
	}

	public async findByEmail(email: string): Promise<UserIdentity | null> {
		const users = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.users)
			.where(eq(this.drizzleService.schema.users.email, email));

		if (users.length > 1) {
			throw new Error("Multiple users found for the same email");
		}
		return users.length === 1 ? this.convertToUserIdentity(users[0]!) : null;
	}

	public async findBySessionId(sessionId: SessionId): Promise<UserIdentity | null> {
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

		return result.length === 1 ? this.convertToUserIdentity(result[0]!.users) : null;
	}

	public async create(registration: UserRegistration): Promise<void> {
		await this.drizzleService.db
			.insert(this.drizzleService.schema.users)
			.values({
				id: registration.id,
				email: registration.email,
				emailVerified: registration.emailVerified,
				name: registration.name,
				iconUrl: registration.iconUrl,
				gender: registration.gender,
				passwordHash: registration.passwordHash,
				createdAt: registration.createdAt,
				updatedAt: registration.updatedAt,
			})
			.onConflictDoNothing({
				target: this.drizzleService.schema.users.id,
			});
	}

	public async update(identity: UserIdentity): Promise<void> {
		await this.drizzleService.db
			.update(this.drizzleService.schema.users)
			.set({
				email: identity.email,
				emailVerified: identity.emailVerified,
				passwordHash: identity.passwordHash,
				updatedAt: identity.updatedAt,
			})
			.where(eq(this.drizzleService.schema.users.id, identity.id));
	}

	private convertToUserIdentity(dto: FoundUserDto): UserIdentity {
		return {
			id: newUserId(dto.id),
			email: dto.email,
			emailVerified: dto.emailVerified,
			passwordHash: dto.passwordHash,
			createdAt: dto.createdAt,
			updatedAt: dto.updatedAt,
		};
	}
}
