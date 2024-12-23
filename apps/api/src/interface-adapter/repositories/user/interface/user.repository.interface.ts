import type { Session } from "../../../../entities/session";
import type { User } from "../../../../entities/user";

export interface IUserRepository {
	find(id: User["id"]): Promise<User | null>;
	findByEmail(email: User["email"]): Promise<User | null>;
	findBySessionId(sessionId: Session["id"]): Promise<User | null>;
	create(user: Omit<ConstructorParameters<typeof User>[0], "createdAt" | "updatedAt">): Promise<User>;
	update(
		id: User["id"],
		user: Partial<Omit<ConstructorParameters<typeof User>[0], "id" | "updatedAt" | "createdAt">>,
	): Promise<User>;
	delete(id: User["id"]): Promise<void>;
}
