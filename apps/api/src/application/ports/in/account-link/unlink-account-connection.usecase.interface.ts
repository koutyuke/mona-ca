import type { Err, Result } from "../../../../common/utils";
import type { ExternalIdentityProvider, UserId } from "../../../../domain/value-object";

type Success = undefined;

type Error = Err<"PROVIDER_NOT_LINKED"> | Err<"UNLINK_OPERATION_FAILED"> | Err<"PASSWORD_NOT_SET">;

export type UnlinkAccountConnectionUseCaseResult = Result<Success, Error>;

export interface IUnlinkAccountConnectionUseCase {
	execute(provider: ExternalIdentityProvider, userId: UserId): Promise<UnlinkAccountConnectionUseCaseResult>;
}
