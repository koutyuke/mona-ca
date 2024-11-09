import type { UserCredential } from "@/domain/user-credential";

export interface IUserCredentialRepository {
	create(
		credential: Omit<ConstructorParameters<typeof UserCredential>[0], "createdAt" | "updatedAt">,
	): Promise<UserCredential>;
	find(userId: UserCredential["userId"]): Promise<UserCredential | null>;
	update(
		userId: UserCredential["userId"],
		credential: Partial<Omit<ConstructorParameters<typeof UserCredential>[0], "userId">>,
	): Promise<UserCredential>;
}
