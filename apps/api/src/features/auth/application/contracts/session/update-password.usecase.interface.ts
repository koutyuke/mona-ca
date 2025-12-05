import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { Session } from "../../../domain/entities/session";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { SessionToken } from "../../../domain/value-objects/tokens";

type Success = Ok<{
	session: Session;
	sessionToken: SessionToken;
}>;

type Error = Err<"INVALID_CURRENT_PASSWORD">;

export type UpdatePasswordUseCaseResult = Result<Success, Error>;

export interface IUpdatePasswordUseCase {
	execute(
		userIdentity: UserCredentials,
		currentPassword: string | null,
		newPassword: string,
	): Promise<UpdatePasswordUseCaseResult>;
}
