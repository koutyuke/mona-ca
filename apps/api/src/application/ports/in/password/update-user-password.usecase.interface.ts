import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { Session, User } from "../../../../domain/entities";
import type { SessionToken } from "../../../../domain/value-object";

type Success = Ok<{
	session: Session;
	sessionToken: SessionToken;
}>;

type Error = Err<"INVALID_CURRENT_PASSWORD">;

export type UpdateUserPasswordUseCaseResult = Result<Success, Error>;

export interface IUpdateUserPasswordUseCase {
	execute(
		user: User,
		currentPassword: string | undefined,
		newPassword: string,
	): Promise<UpdateUserPasswordUseCaseResult>;
}
