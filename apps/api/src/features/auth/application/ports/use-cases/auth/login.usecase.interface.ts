import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { SessionToken } from "../../../../../../common/domain/value-objects";
import type { Session } from "../../../../domain/entities";

type Success = Ok<{
	session: Session;
	sessionToken: SessionToken;
}>;

type Error = Err<"INVALID_CREDENTIALS">;

export type LoginUseCaseResult = Result<Success, Error>;

export interface ILoginUseCase {
	execute(email: string, password: string): Promise<LoginUseCaseResult>;
}
