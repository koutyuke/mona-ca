import type { UserCredentials } from "@/domain/userCredentials";
import type { IUserCredentialsRepository } from "@/interfaceAdapter/repositories/userCredentials";
import type { IUserCredentialsUseCase } from "./interface/IUserCredentialsUseCase";

export class UserCredentialsUseCase implements IUserCredentialsUseCase {
	constructor(private readonly userCredentialsRepository: IUserCredentialsRepository) {}

	public async findCredentialsByUserId(userId: string): Promise<UserCredentials | null> {
		return this.userCredentialsRepository.findByUserId(userId);
	}

	public async updateCredentialsByUserId(
		userId: string,
		credentials: Partial<Omit<UserCredentials, "userId">>,
	): Promise<UserCredentials | null> {
		return this.userCredentialsRepository.update(userId, credentials);
	}

	public async setNullCredentialsByUserId(userId: string): Promise<void> {
		return this.userCredentialsRepository.setNull(userId);
	}
}
