import type { Err, Result } from "../../../../common/utils";
import type { Session, User } from "../../../../domain/entities";
import type { SessionToken } from "../../../../domain/value-object";

type Success = {
	session: Session;
	user: User;
};

type Error = Err<"SESSION_EXPIRED"> | Err<"SESSION_INVALID">;

export type ValidateSessionUseCaseResult = Result<Success, Error>;

export interface IValidateSessionUseCase {
	execute(sessionToken: SessionToken): Promise<ValidateSessionUseCaseResult>;
}
