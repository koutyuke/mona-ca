import type { Err, Result } from "../../../../common/utils";
import type { Session } from "../../../../domain/entities/session";

export type LoginUseCaseSuccessResult = {
	session: Session;
	sessionToken: string;
};

export type LoginUseCaseErrorResult = Err<"INVALID_EMAIL_OR_PASSWORD">;

export type LoginUseCaseResult = Result<LoginUseCaseSuccessResult, LoginUseCaseErrorResult>;

export interface ILoginUseCase {
	execute(email: string, password: string): Promise<LoginUseCaseResult>;
}
