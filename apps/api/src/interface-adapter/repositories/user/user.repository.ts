import type { Session } from "@/domain/session";
import { User } from "@/domain/user";
import { UserCredential } from "@/domain/user-credential";
import type { DrizzleService } from "@/infrastructure/drizzle";
import { eq } from "drizzle-orm";
import type { IUserRepository } from "./interface/user.repository.interface";

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
				this.drizzleService.schema.session,
				eq(this.drizzleService.schema.session.userId, this.drizzleService.schema.users.id),
			)
			.where(eq(this.drizzleService.schema.session.id, sessionId));

		return result.length === 1 ? new User(result[0]!.users) : null;
	}

	public async create(
		user: Omit<ConstructorParameters<typeof User>[0], "createdAt" | "updatedAt">,
		credential?: Partial<Omit<ConstructorParameters<typeof UserCredential>[0], "userId" | "createdAt" | "updatedAt">>,
	): Promise<{ user: User; userCredential: UserCredential }> {
		const { passwordHash = null } = credential ?? {};

		const createdUser = (
			await this.drizzleService.db.insert(this.drizzleService.schema.users).values(user).returning()
		)[0];

		if (!createdUser) {
			throw new Error("Failed to create user");
		}

		const createdUserCredential = (
			await this.drizzleService.db
				.insert(this.drizzleService.schema.userCredentials)
				.values({
					userId: createdUser.id,
					passwordHash: passwordHash,
				})
				.returning()
		)[0];

		if (!createdUserCredential) {
			throw new Error("Failed to create user credential");
		}

		return {
			user: new User(createdUser),
			userCredential: new UserCredential(createdUserCredential),
		};
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
