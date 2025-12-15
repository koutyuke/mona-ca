import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { Session } from "../../../../domain/entities/session";
import type { SessionToken } from "../../../../domain/value-objects/tokens";

type Success = Ok<{
	session: Session;
	sessionToken: SessionToken;
}>;

type Error = Err<"INVALID_CREDENTIALS">;

export type LoginUseCaseResult = Result<Success, Error>;

export interface ILoginUseCase {
	execute(email: string, password: string): Promise<LoginUseCaseResult>;
}
