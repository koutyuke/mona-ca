import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { UserCredentials } from "../../../../domain/entities/user-credentials";
import type { IdentityProviders } from "../../../../domain/value-objects/identity-providers";
import type { ProviderLinkRequestToken } from "../../../../domain/value-objects/tokens";

type Success = Ok<{
	userCredentials: UserCredentials;
}>;

type Error = Err<"INVALID_PROVIDER_LINK_REQUEST">;

export type ProviderLinkValidateRequestUseCaseResult = Result<Success, Error>;

export interface IProviderLinkValidateRequestUseCase {
	execute(
		provider: IdentityProviders,
		providerLinkRequestToken: ProviderLinkRequestToken,
	): Promise<ProviderLinkValidateRequestUseCaseResult>;
}
