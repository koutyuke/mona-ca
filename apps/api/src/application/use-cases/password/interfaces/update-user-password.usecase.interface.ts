import type { Err, Result } from "../../../../common/utils";
import type { Session, User } from "../../../../domain/entities";

type Success = {
	session: Session;
	sessionToken: string;
};

type Error = Err<"INVALID_CURRENT_PASSWORD"> | Err<"REQUIRED_CURRENT_PASSWORD">;

export type UpdateUserPasswordUseCaseResult = Result<Success, Error>;

export interface IUpdateUserPasswordUseCase {
	execute(
		user: User,
		currentPassword: string | undefined,
		newPassword: string,
	): Promise<UpdateUserPasswordUseCaseResult>;
}
