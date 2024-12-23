import type { Session } from "../../../../entities/session";
import type { User } from "../../../../entities/user";

export interface IValidateSessionUseCaseResult {
	session: Session | null;
	user: User | null;
}

export interface IValidateSessionUseCase {
	execute(sessionToken: string): Promise<IValidateSessionUseCaseResult>;
}
