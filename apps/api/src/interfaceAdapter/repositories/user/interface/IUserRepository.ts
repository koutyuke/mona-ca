import type { Session } from "@/domain/session";
import type { User } from "@/domain/user";
import type { UserCredentials } from "@/domain/userCredentials";

export interface IUserRepository {
	findById(id: User["id"]): Promise<User | null>;
	findByEmail(email: User["email"]): Promise<User | null>;
	findBySessionId(sessionId: Session["id"]): Promise<User | null>;
	create(user: Omit<User, "createdAt" | "updatedAt"> & Partial<Omit<UserCredentials, "userId">>): Promise<User>;
	update(id: User["id"], user: Partial<Omit<User, "id" | "updatedAt" | "createdAt">>): Promise<User>;
	delete(id: User["id"]): Promise<void>;
}
