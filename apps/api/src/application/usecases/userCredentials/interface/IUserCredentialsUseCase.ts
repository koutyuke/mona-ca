import type { UserCredentials } from "@/domain/userCredentials";

export interface IUserCredentialsUseCase {
	findCredentialsByUserId(userId: string): Promise<UserCredentials | null>;
	updateCredentialsByUserId(
		userId: string,
		credentials: Partial<Omit<UserCredentials, "userId">>,
	): Promise<UserCredentials | null>;
	setNullCredentialsByUserId(userId: string): Promise<void>;
}
