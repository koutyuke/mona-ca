import { UserCredential } from "@/domain/user-credential";
import type { DrizzleService } from "@/infrastructure/drizzle";
import { eq } from "drizzle-orm";
import type { IUserCredentialRepository } from "./interface/user-credential.repository.interface";

export class UserCredentialRepository implements IUserCredentialRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async find(userId: UserCredential["userId"]): Promise<UserCredential | null> {
		const userCredentials = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.userCredentials)
			.where(eq(this.drizzleService.schema.userCredentials.userId, userId))
			.execute();

		return userCredentials.length === 1 ? new UserCredential(userCredentials[0]!) : null;
	}

	public async update(
		userId: UserCredential["userId"],
		credential: Partial<Omit<ConstructorParameters<typeof UserCredential>[0], "userId">>,
	): Promise<UserCredential> {
		const updatedUserCredentials = await this.drizzleService.db
			.update(this.drizzleService.schema.userCredentials)
			.set(credential)
			.where(eq(this.drizzleService.schema.userCredentials.userId, userId))
			.returning();

		const updatedUserCredential = updatedUserCredentials[0];

		if (!updatedUserCredential) {
			throw new Error("Failed to update user credential");
		}

		return new UserCredential(updatedUserCredential);
	}
}