import type { Session } from "@/domain/session";
import type { User } from "@/domain/user";
import type { UserCredential } from "@/domain/user-credential";

export interface IUserRepository {
	find(id: User["id"]): Promise<User | null>;
	findByEmail(email: User["email"]): Promise<User | null>;
	findBySessionId(sessionId: Session["id"]): Promise<User | null>;
	create(
		user: Omit<ConstructorParameters<typeof User>[0], "createdAt" | "updatedAt">,
		credential?: Partial<Omit<ConstructorParameters<typeof UserCredential>[0], "userId" | "createdAt" | "updatedAt">>,
	): Promise<{ user: User; userCredential: UserCredential }>;
	update(
		id: User["id"],
		user: Partial<Omit<ConstructorParameters<typeof User>[0], "id" | "updatedAt" | "createdAt">>,
	): Promise<User>;
	delete(id: User["id"]): Promise<void>;
}
