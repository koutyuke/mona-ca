import { UserCredentials } from "@/domain/userCredentials";
import { DrizzleService } from "@/infrastructure/drizzle";
import { eq } from "drizzle-orm";
import type { IUserCredentialsRepository } from "./interface/IUserCredentialsRepository";

export class UserCredentialsRepository implements IUserCredentialsRepository {
	private readonly drizzleService: DrizzleService;

	constructor(args: {
		db: D1Database;
	}) {
		this.drizzleService = new DrizzleService(args.db);
	}

	async findByUserId(userId: UserCredentials["userId"]): Promise<UserCredentials | null> {
		const userCredentials = await this.drizzleService.db
			.select({
				userId: this.drizzleService.schema.users.id,
				hashedPassword: this.drizzleService.schema.users.hashedPassword,
			})
			.from(this.drizzleService.schema.users)
			.where(eq(this.drizzleService.schema.users.id, userId));

		return userCredentials.length === 1 ? new UserCredentials(userCredentials[0]!) : null;
	}

	async update(
		userId: UserCredentials["userId"],
		credentials: Partial<Omit<UserCredentials, "userId">>,
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

	async setNull(userId: UserCredentials["userId"]): Promise<void> {
		await this.drizzleService.db
			.update(this.drizzleService.schema.users)
			.set({ hashedPassword: null })
			.where(eq(this.drizzleService.schema.users.id, userId))
			.execute();
	}
}
