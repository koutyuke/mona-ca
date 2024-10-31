import type { UserCredential } from "@/domain/user-credential";

export interface IUserCredentialUseCase {
	getUserCredential(userId: string): Promise<UserCredential | null>;
	updateUserCredential(
		userId: string,
		credential: Partial<Omit<ConstructorParameters<typeof UserCredential>[0], "userId">>,
	): Promise<UserCredential>;
}
