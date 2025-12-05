import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { IdentityProviders } from "../../../domain/value-objects/identity-providers";

type Success = Ok;

type Error = Err<"PROVIDER_NOT_CONNECTED"> | Err<"PASSWORD_NOT_SET">;

export type ProviderConnectionDisconnectUseCaseResult = Result<Success, Error>;
export interface IProviderConnectionDisconnectUseCase {
	execute(
		provider: IdentityProviders,
		userCredentials: UserCredentials,
	): Promise<ProviderConnectionDisconnectUseCaseResult>;
}
