import type { Session } from "../../../../domain/session";
import type { User } from "../../../../domain/user";

export interface IValidateSessionUseCaseResult {
	session: Session | null;
	user: User | null;
}

export interface IValidateSessionUseCase {
	execute(sessionToken: string): Promise<IValidateSessionUseCaseResult>;
}
