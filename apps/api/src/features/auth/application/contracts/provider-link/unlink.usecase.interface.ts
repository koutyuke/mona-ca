import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { IdentityProviders } from "../../../domain/value-objects/identity-providers";

type Success = Ok;

type Error = Err<"PROVIDER_NOT_LINKED"> | Err<"PASSWORD_NOT_SET">;

export type ProviderLinkUnlinkUseCaseResult = Result<Success, Error>;
export interface IProviderLinkUnlinkUseCase {
	execute(provider: IdentityProviders, userCredentials: UserCredentials): Promise<ProviderLinkUnlinkUseCaseResult>;
}
