import type { Session } from "@/domain/session";
import type { User } from "@/domain/user";
import type { UserCredential } from "@/domain/user-credential";

export interface IUserUseCase {
	getUser(id: User["id"]): Promise<User | null>;
	getUserByEmail(email: User["email"]): Promise<User | null>;
	getUserBySessionId(sessionId: Session["id"]): Promise<User | null>;
	createUser(
		user: Omit<ConstructorParameters<typeof User>[0], "id" | "createdAt" | "updatedAt">,
		options?: {
			id?: ConstructorParameters<typeof User>[0]["id"];
			credential?: Partial<Omit<ConstructorParameters<typeof UserCredential>[0], "userId" | "createdAt" | "updatedAt">>;
		},
	): Promise<{ user: User; userCredential: UserCredential }>;
	updateUser(
		id: User["id"],
		user: Partial<Omit<ConstructorParameters<typeof User>[0], "id" | "updatedAt" | "createdAt">>,
	): Promise<User>;
	deleteUser(id: User["id"]): Promise<void>;
}
