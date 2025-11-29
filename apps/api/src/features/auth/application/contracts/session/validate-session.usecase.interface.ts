import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { Session } from "../../../domain/entities/session";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { SessionToken } from "../../../domain/value-objects/tokens";

type Success = Ok<{
	userCredentials: UserCredentials;
	session: Session;
}>;

type Error = Err<"SESSION_EXPIRED"> | Err<"SESSION_INVALID">;

export type ValidateSessionUseCaseResult = Result<Success, Error>;

export interface IValidateSessionUseCase {
	execute(sessionToken: SessionToken): Promise<ValidateSessionUseCaseResult>;
}
