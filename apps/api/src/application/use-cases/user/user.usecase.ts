import type { Session } from "@/domain/session";
import type { User } from "@/domain/user";
import type { UserCredentials } from "@/domain/user-credentials";
import type { IUserRepository } from "@/interface-adapter/repositories/user";
import { generateIdFromEntropySize } from "lucia";
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
		user: Omit<ConstructorParameters<typeof User>[0], "id" | "createdAt" | "updatedAt"> &
			Partial<Pick<ConstructorParameters<typeof User>[0], "id">> &
			Partial<Omit<ConstructorParameters<typeof UserCredentials>[0], "userId">>,
	): Promise<User> {
		const id = user.id ?? this.generateId();
		return this.userRepository.create({
			id,
			...user,
		});
	}

	public generateId(): string {
		// 16-characters
		return generateIdFromEntropySize(10);
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
