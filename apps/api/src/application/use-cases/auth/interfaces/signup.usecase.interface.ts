import type { Session } from "../../../../domain/entities/session";
import type { User } from "../../../../domain/entities/user";

export interface ISignupUseCaseResult {
	user: User;
	session: Session;
	sessionToken: string;
}

export interface ISignupUseCase {
	execute(name: string, email: string, password: string, gender: "man" | "woman"): Promise<ISignupUseCaseResult>;
}
