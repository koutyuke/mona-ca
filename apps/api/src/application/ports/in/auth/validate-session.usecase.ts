import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { Session, User } from "../../../../domain/entities";
import type { SessionToken } from "../../../../domain/value-objects";

type Success = Ok<{
	session: Session;
	user: User;
}>;

type Error = Err<"SESSION_EXPIRED"> | Err<"SESSION_INVALID">;

export type ValidateSessionUseCaseResult = Result<Success, Error>;

export interface IValidateSessionUseCase {
	execute(sessionToken: SessionToken): Promise<ValidateSessionUseCaseResult>;
}
