import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { Session } from "../../../domain/entities/session";
import type { UserIdentity } from "../../../domain/entities/user-identity";
import type { SessionToken } from "../../../domain/value-objects/session-token";

type Success = Ok<{
	session: Session;
	sessionToken: SessionToken;
}>;

type Error = Err<"INVALID_CURRENT_PASSWORD">;

export type UpdatePasswordUseCaseResult = Result<Success, Error>;

export interface IUpdatePasswordUseCase {
	execute(
		userIdentity: UserIdentity,
		currentPassword: string | null,
		newPassword: string,
	): Promise<UpdatePasswordUseCaseResult>;
}
