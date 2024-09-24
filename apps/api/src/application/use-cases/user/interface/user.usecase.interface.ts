import type { Session } from "@/domain/session";
import type { User } from "@/domain/user";
import type { UserCredentials } from "@/domain/user-credentials";

export interface IUserUseCase {
	getUser(id: User["id"]): Promise<User | null>;
	getUserByEmail(email: User["email"]): Promise<User | null>;
	getUserBySessionId(sessionId: Session["id"]): Promise<User | null>;
	createUser(
		user: Omit<ConstructorParameters<typeof User>[0], "id" | "createdAt" | "updatedAt"> &
			Partial<Pick<ConstructorParameters<typeof User>[0], "id">> &
			Partial<Omit<ConstructorParameters<typeof UserCredentials>[0], "userId">>,
	): Promise<User>;
	updateUser(
		id: User["id"],
		user: Partial<Omit<ConstructorParameters<typeof User>[0], "id" | "updatedAt" | "createdAt">>,
	): Promise<User>;
	deleteUser(id: User["id"]): Promise<void>;
	generateId(): string;
}
