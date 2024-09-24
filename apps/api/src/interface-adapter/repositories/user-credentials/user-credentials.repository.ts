import { UserCredentials } from "@/domain/user-credentials";
import { DrizzleService } from "@/infrastructure/drizzle";
import { eq } from "drizzle-orm";
import type { IUserCredentialsRepository } from "./interface/user-credentials.repository.interface";

export class UserCredentialsRepository implements IUserCredentialsRepository {
	private readonly drizzleService: DrizzleService;

	constructor(args: {
		db: D1Database;
	}) {
		this.drizzleService = new DrizzleService(args.db);
	}

	public async find(userId: UserCredentials["userId"]): Promise<UserCredentials | null> {
		const userCredentials = await this.drizzleService.db
			.select({
				userId: this.drizzleService.schema.users.id,
				hashedPassword: this.drizzleService.schema.users.hashedPassword,
			})
			.from(this.drizzleService.schema.users)
			.where(eq(this.drizzleService.schema.users.id, userId));

		return userCredentials.length === 1 ? new UserCredentials(userCredentials[0]!) : null;
	}

	public async update(
		userId: UserCredentials["userId"],
		credentials: Partial<Omit<ConstructorParameters<typeof UserCredentials>[0], "userId">>,
	): Promise<UserCredentials | null> {
		const updatedUserCredentials = await this.drizzleService.db
			.update(this.drizzleService.schema.users)
			.set(credentials)
			.where(eq(this.drizzleService.schema.users.id, userId))
			.returning({
				userId: this.drizzleService.schema.users.id,
				hashedPassword: this.drizzleService.schema.users.hashedPassword,
			});

		return updatedUserCredentials.length === 1 ? new UserCredentials(updatedUserCredentials[0]!) : null;
	}

	public async setNullToHashedPassword(userId: UserCredentials["userId"]): Promise<void> {
		await this.drizzleService.db
			.update(this.drizzleService.schema.users)
			.set({ hashedPassword: null })
			.where(eq(this.drizzleService.schema.users.id, userId))
			.execute();
	}
}
