import type { Err, Result } from "../../../../common/utils";
import type { Session, User } from "../../../../domain/entities";

export type ValidateSessionUseCaseSuccessResult = {
	session: Session;
	user: User;
};

export type ValidateSessionUseCaseErrorResult =
	| Err<"SESSION_OR_USER_NOT_FOUND">
	| Err<"EXPIRED_SESSION">
	| Err<"INVALID_SESSION_TOKEN">;

export type ValidateSessionUseCaseResult = Result<
	ValidateSessionUseCaseSuccessResult,
	ValidateSessionUseCaseErrorResult
>;

export interface IValidateSessionUseCase {
	execute(sessionToken: string): Promise<ValidateSessionUseCaseResult>;
}
