import type { UserCredential } from "@/domain/user-credential";

export interface IUserCredentialRepository {
	find(userId: UserCredential["userId"]): Promise<UserCredential | null>;
	update(
		userId: UserCredential["userId"],
		credential: Partial<Omit<ConstructorParameters<typeof UserCredential>[0], "userId">>,
	): Promise<UserCredential>;
}
