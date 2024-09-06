import type { Session } from "@/domain/session";
import type { User } from "@/domain/user";
import type { UserCredentials } from "@/domain/user-credentials";
import type { IUserRepository } from "@/interface-adapter/repositories/user";
import { generateIdFromEntropySize } from "lucia";
import type { IUserUseCase } from "./interface/user.usecase.interface";

export class UserUseCase implements IUserUseCase {
	constructor(private userRepository: IUserRepository) {}

	public async findUser(id: User["id"]): Promise<User | null> {
		return this.userRepository.findById(id);
	}

	public async findUserByEmail(email: User["email"]): Promise<User | null> {
		return this.userRepository.findByEmail(email);
	}

	public async findUserBySessionId(sessionId: Session["id"]): Promise<User | null> {
		return this.userRepository.findBySessionId(sessionId);
	}

	public async createUser(
		user: Omit<User, "id" | "createdAt" | "updatedAt"> & Partial<Pick<User, "id"> & Omit<UserCredentials, "userId">>,
	): Promise<User> {
		const id = user.id ?? this.genId();
		return this.userRepository.create({
			id,
			...user,
		});
	}

	public genId(): string {
		// 16-characters
		return generateIdFromEntropySize(10);
	}

	public async updateUser(id: string, user: Partial<Omit<User, "id" | "updatedAt" | "createdAt">>): Promise<User> {
		return await this.userRepository.update(id, user);
	}

	public async deleteUser(id: User["id"]): Promise<void> {
		await this.userRepository.delete(id);
	}
}
