import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { UserIdentity } from "../../../domain/entities/user-identity";
import type { ExternalIdentityProvider } from "../../../domain/value-objects/external-identity";

type Success = Ok;

type Error = Err<"PROVIDER_NOT_LINKED"> | Err<"PASSWORD_NOT_SET">;

export type UnlinkAccountConnectionUseCaseResult = Result<Success, Error>;

export interface IUnlinkAccountConnectionUseCase {
	execute(
		provider: ExternalIdentityProvider,
		userIdentity: UserIdentity,
	): Promise<UnlinkAccountConnectionUseCaseResult>;
}
