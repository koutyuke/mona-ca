import type { Err, Result } from "../../../../common/utils";
import type { Session } from "../../../../domain/entities";

type Success = {
	session: Session;
	sessionToken: string;
};

type Error = Err<"INVALID_EMAIL_OR_PASSWORD">;

export type LoginUseCaseResult = Result<Success, Error>;

export interface ILoginUseCase {
	execute(email: string, password: string): Promise<LoginUseCaseResult>;
}
