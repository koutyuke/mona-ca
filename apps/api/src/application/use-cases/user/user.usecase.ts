import type { Session } from "@/domain/session";
import type { User } from "@/domain/user";
import type { UserCredential } from "@/domain/user-credential";
import type { IUserRepository } from "@/interface-adapter/repositories/user";
import { ulid } from "ulid";
import type { IUserUseCase } from "./interface/user.usecase.interface";

export class UserUseCase implements IUserUseCase {
	constructor(private userRepository: IUserRepository) {}

	public async getUser(id: User["id"]): Promise<User | null> {
		return this.userRepository.find(id);
	}

	public async getUserByEmail(email: User["email"]): Promise<User | null> {
		return this.userRepository.findByEmail(email);
	}

	public async getUserBySessionId(sessionId: Session["id"]): Promise<User | null> {
		return this.userRepository.findBySessionId(sessionId);
	}

	public async createUser(
		user: Omit<ConstructorParameters<typeof User>[0], "id" | "createdAt" | "updatedAt">,
		options?: {
			id?: ConstructorParameters<typeof User>[0]["id"];
			credential?: Partial<Omit<ConstructorParameters<typeof UserCredential>[0], "userId" | "createdAt" | "updatedAt">>;
		},
	): Promise<{ user: User; userCredential: UserCredential }> {
		const { id = ulid(), credential } = options ?? {};

		return await this.userRepository.create(
			{
				...user,
				id,
			},
			credential,
		);
	}

	public async updateUser(
		id: string,
		user: Partial<Omit<ConstructorParameters<typeof User>[0], "id" | "updatedAt" | "createdAt">>,
	): Promise<User> {
		return await this.userRepository.update(id, user);
	}

	public async deleteUser(id: User["id"]): Promise<void> {
		await this.userRepository.delete(id);
	}
}
