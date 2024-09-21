import type { UserCredentials } from "@/domain/user-credentials";

export interface IUserCredentialsRepository {
	find(userId: UserCredentials["userId"]): Promise<UserCredentials | null>;
	update(
		userId: UserCredentials["userId"],
		credentials: Partial<Omit<UserCredentials, "userId">>,
	): Promise<UserCredentials | null>;
	setNullToHashedPassword(userId: UserCredentials["userId"]): Promise<void>;
}
