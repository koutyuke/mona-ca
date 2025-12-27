import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { Session } from "../../../../domain/entities/session";
import type { UserCredentials } from "../../../../domain/entities/user-credentials";
import type { SessionToken } from "../../../../domain/value-objects/tokens";

type Success = Ok<{
	userCredentials: UserCredentials;
	session: Session;
}>;

type Error = Err<"INVALID_SESSION">;

export type ValidateSessionUseCaseResult = Result<Success, Error>;

export interface IValidateSessionUseCase {
	execute(sessionToken: SessionToken): Promise<ValidateSessionUseCaseResult>;
}
