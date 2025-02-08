import type { Session } from "../../../../models/entities/session";
import type { User } from "../../../../models/entities/user";

export interface IValidateSessionUseCaseResult {
	session: Session | null;
	user: User | null;
}

export interface IValidateSessionUseCase {
	execute(sessionToken: string): Promise<IValidateSessionUseCaseResult>;
}
