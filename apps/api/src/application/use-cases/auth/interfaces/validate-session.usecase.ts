import type { Err, Result } from "../../../../common/utils";
import type { Session, User } from "../../../../domain/entities";

type Success = {
	session: Session;
	user: User;
};

type Error = Err<"EXPIRED_SESSION"> | Err<"INVALID_SESSION">;

export type ValidateSessionUseCaseResult = Result<Success, Error>;

export interface IValidateSessionUseCase {
	execute(sessionToken: string): Promise<ValidateSessionUseCaseResult>;
}
