import { eq } from "drizzle-orm";
import { newUserId } from "../../../../../core/domain/value-objects";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { DrizzleService } from "../../../../../core/infra/drizzle";
import type { IAuthUserRepository } from "../../../application/ports/out/repositories/auth-user.repository.interface";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { UserRegistration } from "../../../domain/entities/user-registration";
import type { SessionId } from "../../../domain/value-objects/ids";

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

export class AuthUserRepository implements IAuthUserRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findById(id: UserId): Promise<UserCredentials | null> {
		const users = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.usersTable)
			.where(eq(this.drizzleService.schema.usersTable.id, id));

		if (users.length > 1) {
			throw new Error("Multiple users found for the same id");
		}

		return users.length === 1 ? this.convertToUserIdentity(users[0]!) : null;
	}

	public async findByEmail(email: string): Promise<UserCredentials | null> {
		const users = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.usersTable)
			.where(eq(this.drizzleService.schema.usersTable.email, email));

		if (users.length > 1) {
			throw new Error("Multiple users found for the same email");
		}
		return users.length === 1 ? this.convertToUserIdentity(users[0]!) : null;
	}

	public async findBySessionId(sessionId: SessionId): Promise<UserCredentials | null> {
		const result = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.usersTable)
			.innerJoin(
				this.drizzleService.schema.sessionsTable,
				eq(this.drizzleService.schema.sessionsTable.userId, this.drizzleService.schema.usersTable.id),
			)
			.where(eq(this.drizzleService.schema.sessionsTable.id, sessionId));

		if (result.length > 1) {
			throw new Error("Multiple users found for the same session");
		}

		return result.length === 1 ? this.convertToUserIdentity(result[0]!.users) : null;
	}

	public async create(registration: UserRegistration): Promise<void> {
		await this.drizzleService.db
			.insert(this.drizzleService.schema.usersTable)
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
				target: this.drizzleService.schema.usersTable.id,
			});
	}

	public async update(identity: UserCredentials): Promise<void> {
		await this.drizzleService.db
			.update(this.drizzleService.schema.usersTable)
			.set({
				email: identity.email,
				emailVerified: identity.emailVerified,
				passwordHash: identity.passwordHash,
				updatedAt: identity.updatedAt,
			})
			.where(eq(this.drizzleService.schema.usersTable.id, identity.id));
	}

	private convertToUserIdentity(dto: FoundUserDto): UserCredentials {
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
