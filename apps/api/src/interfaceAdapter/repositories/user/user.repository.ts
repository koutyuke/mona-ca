import type { Session } from "@/domain/session";
import { User } from "@/domain/user";
import type { UserCredentials } from "@/domain/userCredentials";
import { DrizzleService } from "@/infrastructure/drizzle";
import { eq } from "drizzle-orm";
import type { IUserRepository } from "./interface/IUserRepository";

export class UserRepository implements IUserRepository {
	private readonly drizzleService: DrizzleService;
	constructor(args: {
		db: D1Database;
	}) {
		this.drizzleService = new DrizzleService(args.db);
	}

	async findById(id: string): Promise<User | null> {
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

	async findByEmail(email: string): Promise<User | null> {
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

	async findBySessionId(sessionId: Session["id"]): Promise<User | null> {
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

	async create(user: Omit<User, "createdAt" | "updatedAt"> & Partial<Omit<UserCredentials, "userId">>): Promise<User> {
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

	async update(id: User["id"], user: Partial<Omit<User, "id" | "updatedAt" | "createdAt">>): Promise<User> {
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

	async delete(id: User["id"]): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.users)
			.where(eq(this.drizzleService.schema.users.id, id));
	}
}
