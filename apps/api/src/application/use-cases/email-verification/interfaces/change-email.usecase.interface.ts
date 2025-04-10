import type { Err, Result } from "../../../../common/utils";
import type { Session, User } from "../../../../domain/entities";

type ChangeEmailUseCaseSuccessResult = {
	session: Session;
	sessionToken: string;
};

export type ChangeEmailUseCaseErrorResult =
	| Err<"INVALID_CODE">
	| Err<"CODE_WAS_EXPIRED">
	| Err<"NOT_REQUEST">
	| Err<"EMAIL_IS_ALREADY_USED">;

export type ChangeEmailUseCaseResult = Result<ChangeEmailUseCaseSuccessResult, ChangeEmailUseCaseErrorResult>;

export interface IChangeEmailUseCase {
	execute(emailVerificationSessionToken: string, code: string, user: User): Promise<ChangeEmailUseCaseResult>;
}
