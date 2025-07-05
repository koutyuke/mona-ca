import type { Err, Result } from "../../../../common/utils";
import type { OAuthProvider, UserId } from "../../../../domain/value-object";

type Success = undefined;

type Error = Err<"ACCOUNT_NOT_LINKED"> | Err<"UNLINK_OPERATION_FAILED"> | Err<"PASSWORD_NOT_SET">;

export type UnlinkAccountConnectionUseCaseResult = Result<Success, Error>;

export interface IUnlinkAccountConnectionUseCase {
	execute(provider: OAuthProvider, userId: UserId): Promise<UnlinkAccountConnectionUseCaseResult>;
}
