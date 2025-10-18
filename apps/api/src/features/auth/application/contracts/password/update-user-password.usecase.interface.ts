import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { UserId } from "../../../../../shared/domain/value-objects";
import type { Session } from "../../../domain/entities/session";
import type { SessionToken } from "../../../domain/value-objects/session-token";

type Success = Ok<{
	session: Session;
	sessionToken: SessionToken;
}>;

type Error = Err<"INVALID_CURRENT_PASSWORD">;

export type UpdateUserPasswordUseCaseResult = Result<Success, Error>;

export interface IUpdateUserPasswordUseCase {
	execute(
		userId: UserId,
		currentPassword: string | undefined,
		newPassword: string,
	): Promise<UpdateUserPasswordUseCaseResult>;
}
