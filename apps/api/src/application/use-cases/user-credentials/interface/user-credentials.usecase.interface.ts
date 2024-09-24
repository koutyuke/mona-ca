import type { UserCredentials } from "@/domain/user-credentials";

export interface IUserCredentialsUseCase {
	getUserCredential(userId: string): Promise<UserCredentials | null>;
	updateUserCredential(
		userId: string,
		credentials: Partial<Omit<ConstructorParameters<typeof UserCredentials>[0], "userId">>,
	): Promise<UserCredentials | null>;
	setNullToHashedPassword(userId: string): Promise<void>;
}
