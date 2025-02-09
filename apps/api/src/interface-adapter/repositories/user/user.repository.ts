import { eq } from "drizzle-orm";
import type { Session } from "../../../domain/entities/session";
import { User } from "../../../domain/entities/user";
import type { DrizzleService } from "../../../infrastructure/drizzle";
import type { IUserRepository } from "./interfaces/user.repository.interface";

export class UserRepository implements IUserRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async find(id: string): Promise<User | null> {
		const user = await this.drizzleService.db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, id),
		});

		return user
			? new User({
					...user,
					createdAt: new Date(user.createdAt),
					updatedAt: new Date(user.updatedAt),
				})
			: null;
	}

	public async findByEmail(email: string): Promise<User | null> {
		const user = await this.drizzleService.db.query.users.findFirst({
			where: (users, { eq }) => eq(users.email, email),
		});

		return user
			? new User({
					...user,
					createdAt: new Date(user.createdAt),
					updatedAt: new Date(user.updatedAt),
				})
			: null;
	}

	public async findBySessionId(sessionId: Session["id"]): Promise<User | null> {
		const result = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.users)
			.innerJoin(
				this.drizzleService.schema.sessions,
				eq(this.drizzleService.schema.sessions.userId, this.drizzleService.schema.users.id),
			)
			.where(eq(this.drizzleService.schema.sessions.id, sessionId));

		return result.length === 1 ? new User(result[0]!.users) : null;
	}

	public async create(user: Omit<ConstructorParameters<typeof User>[0], "createdAt" | "updatedAt">): Promise<User> {
		const results = await this.drizzleService.db.insert(this.drizzleService.schema.users).values(user).returning();

		if (results.length !== 1) {
			throw new Error("Failed to create user");
		}

		return new User(results[0]!);
	}

	public async update(
		id: User["id"],
		user: Partial<Omit<ConstructorParameters<typeof User>[0], "id" | "updatedAt" | "createdAt">>,
	): Promise<User> {
		const updatedUsers = await this.drizzleService.db
			.update(this.drizzleService.schema.users)
			.set(user)
			.where(eq(this.drizzleService.schema.users.id, id))
			.returning();

		const updatedUser = updatedUsers[0];

		if (!updatedUser) {
			throw new Error("Failed to update user");
		}
		return new User(updatedUser);
	}

	public async delete(id: User["id"]): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.users)
			.where(eq(this.drizzleService.schema.users.id, id));
	}
}
