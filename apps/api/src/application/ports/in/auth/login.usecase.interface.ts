import type { Err, Result } from "../../../../common/utils";
import type { Session } from "../../../../domain/entities";
import type { SessionToken } from "../../../../domain/value-object";

type Success = {
	session: Session;
	sessionToken: SessionToken;
};

type Error = Err<"INVALID_CREDENTIALS">;

export type LoginUseCaseResult = Result<Success, Error>;

export interface ILoginUseCase {
	execute(email: string, password: string): Promise<LoginUseCaseResult>;
}
