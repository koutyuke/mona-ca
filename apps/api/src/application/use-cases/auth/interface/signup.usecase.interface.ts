import type { Session } from "@/domain/session";
import type { User } from "@/domain/user";

export interface ISignupUseCaseResult {
	user: User;
	session: Session;
	sessionToken: string;
}

export interface ISignupUseCase {
	execute(name: string, email: string, password: string, gender: "man" | "woman"): Promise<ISignupUseCaseResult>;
}
