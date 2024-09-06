import type { UserCredentials } from "@/domain/user-credentials";

export interface IUserCredentialsRepository {
	findByUserId(userId: UserCredentials["userId"]): Promise<UserCredentials | null>;
	update(
		userId: UserCredentials["userId"],
		credentials: Partial<Omit<UserCredentials, "userId">>,
	): Promise<UserCredentials | null>;
	setNull(userId: UserCredentials["userId"]): Promise<void>;
}
