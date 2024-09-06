import type { Session } from "@/domain/session";
import type { User } from "@/domain/user";
import type { UserCredentials } from "@/domain/user-credentials";

export interface IUserUseCase {
	findUser(id: User["id"]): Promise<User | null>;
	findUserByEmail(email: User["email"]): Promise<User | null>;
	findUserBySessionId(sessionId: Session["id"]): Promise<User | null>;
	createUser(
		user: Omit<User, "id" | "createdAt" | "updatedAt"> & Partial<Pick<User, "id"> & Omit<UserCredentials, "userId">>,
	): Promise<User>;
	updateUser(id: User["id"], user: Partial<Omit<User, "updatedAt" | "createdAt">>): Promise<User>;
	deleteUser(id: User["id"]): Promise<void>;
	genId(): string;
}
