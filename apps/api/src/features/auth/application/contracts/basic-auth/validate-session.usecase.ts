import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { Session } from "../../../domain/entities/session";
import type { UserIdentity } from "../../../domain/entities/user-identity";
import type { SessionToken } from "../../../domain/value-objects/session-token";

type Success = Ok<{
	userIdentity: UserIdentity;
	session: Session;
}>;

type Error = Err<"SESSION_EXPIRED"> | Err<"SESSION_INVALID">;

export type ValidateSessionUseCaseResult = Result<Success, Error>;

export interface IValidateSessionUseCase {
	execute(sessionToken: SessionToken): Promise<ValidateSessionUseCaseResult>;
}
