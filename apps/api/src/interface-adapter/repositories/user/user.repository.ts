import type { Session } from "@/domain/session";
import { User } from "@/domain/user";
import type { UserCredentials } from "@/domain/user-credentials";
import { DrizzleService } from "@/infrastructure/drizzle";
import { eq } from "drizzle-orm";
import type { IUserRepository } from "./interface/user.repository.interface";

export class UserRepository implements IUserRepository {
	private readonly drizzleService: DrizzleService;
	constructor(args: {
		db: D1Database;
	}) {
		this.drizzleService = new DrizzleService(args.db);
	}

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
				this.drizzleService.schema.session,
				eq(this.drizzleService.schema.session.userId, this.drizzleService.schema.users.id),
			)
			.where(eq(this.drizzleService.schema.session.id, sessionId));

		return result.length === 1 ? new User(result[0]!.users) : null;
	}

	public async create(
		user: Omit<ConstructorParameters<typeof User>[0], "createdAt" | "updatedAt"> &
			Partial<Omit<ConstructorParameters<typeof UserCredentials>[0], "userId">>,
	): Promise<User> {
		const createdUsers = await this.drizzleService.db
			.insert(this.drizzleService.schema.users)
			.values({
				...user,
				hashedPassword: user.hashedPassword ?? null,
			})
			.returning();

		const createdUser = createdUsers[0];

		if (!createdUser) {
			throw new Error("Failed to create user");
		}

		return new User(createdUser);
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
