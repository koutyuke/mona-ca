import type { UserCredential } from "@/domain/user-credential";
import type { IUserCredentialRepository } from "@/interface-adapter/repositories/user-credential";
import type { IUserCredentialUseCase } from "./interface/user-credential.usecase.interface";

export class UserCredentialUseCase implements IUserCredentialUseCase {
	constructor(private readonly userCredentialRepository: IUserCredentialRepository) {}

	public async getUserCredential(userId: string): Promise<UserCredential | null> {
		return this.userCredentialRepository.find(userId);
	}

	public async updateUserCredential(
		userId: string,
		credentials: Partial<Omit<ConstructorParameters<typeof UserCredential>[0], "userId">>,
	): Promise<UserCredential> {
		return this.userCredentialRepository.update(userId, credentials);
	}
}
