import type { Err, Result } from "../../../../common/utils";
import type { Session } from "../../../../domain/entities/session";
import type { User } from "../../../../domain/entities/user";

export type ValidateSessionUseCaseSuccessResult = {
	session: Session;
	user: User;
};

export type ValidateSessionUseCaseErrorResult = Err<"SESSION_OR_USER_NOT_FOUND"> | Err<"SESSION_EXPIRED">;

export type ValidateSessionUseCaseResult = Result<
	ValidateSessionUseCaseSuccessResult,
	ValidateSessionUseCaseErrorResult
>;

export interface IValidateSessionUseCase {
	execute(sessionToken: string): Promise<ValidateSessionUseCaseResult>;
}
