import type { Err, Result } from "../../../../common/utils";
import type { Session, User } from "../../../../domain/entities";

type Success = {
	session: Session;
	user: User;
};

type Error = Err<"SESSION_EXPIRED"> | Err<"SESSION_INVALID">;

export type ValidateSessionUseCaseResult = Result<Success, Error>;

export interface IValidateSessionUseCase {
	execute(sessionToken: string): Promise<ValidateSessionUseCaseResult>;
}
