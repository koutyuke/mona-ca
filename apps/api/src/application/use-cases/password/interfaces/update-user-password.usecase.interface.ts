import type { Err, Result } from "../../../../common/utils";
import type { Session, User } from "../../../../domain/entities";

type UpdateUserPasswordUseCaseSuccessResult = {
	session: Session;
	sessionToken: string;
};

type UpdateUserPasswordUseCaseErrorResult = Err<"INVALID_CURRENT_PASSWORD" | "CURRENT_PASSWORD_REQUIRED">;

export type UpdateUserPasswordUseCaseResult = Result<
	UpdateUserPasswordUseCaseSuccessResult,
	UpdateUserPasswordUseCaseErrorResult
>;

export interface IUpdateUserPasswordUseCase {
	execute(
		currentUser: User,
		currentPassword: string | undefined,
		newPassword: string,
	): Promise<UpdateUserPasswordUseCaseResult>;
}
