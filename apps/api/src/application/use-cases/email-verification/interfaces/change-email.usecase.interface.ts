import type { Err, Result } from "../../../../common/utils";
import type { User } from "../../../../domain/entities";

export type ChangeEmailUseCaseErrorResult =
	| Err<"INVALID_CODE">
	| Err<"CODE_WAS_EXPIRED">
	| Err<"NOT_REQUEST">
	| Err<"INVALID_EMAIL">
	| Err<"EMAIL_IS_ALREADY_USED">;

export type ChangeEmailUseCaseResult = Result<void, ChangeEmailUseCaseErrorResult>;

export interface IChangeEmailUseCase {
	execute(
		emailVerificationSessionToken: string,
		email: string,
		code: string,
		user: User,
	): Promise<ChangeEmailUseCaseResult>;
}
