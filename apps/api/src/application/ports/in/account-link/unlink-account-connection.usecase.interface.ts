import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { ExternalIdentityProvider, UserId } from "../../../../domain/value-object";

type Success = Ok;

type Error = Err<"PROVIDER_NOT_LINKED"> | Err<"UNLINK_OPERATION_FAILED"> | Err<"PASSWORD_NOT_SET">;

export type UnlinkAccountConnectionUseCaseResult = Result<Success, Error>;

export interface IUnlinkAccountConnectionUseCase {
	execute(provider: ExternalIdentityProvider, userId: UserId): Promise<UnlinkAccountConnectionUseCaseResult>;
}
