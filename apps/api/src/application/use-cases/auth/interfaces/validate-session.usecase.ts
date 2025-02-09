import type { Session } from "../../../../domain/entities/session";
import type { User } from "../../../../domain/entities/user";

export interface IValidateSessionUseCaseResult {
	session: Session | null;
	user: User | null;
}

export interface IValidateSessionUseCase {
	execute(sessionToken: string): Promise<IValidateSessionUseCaseResult>;
}
