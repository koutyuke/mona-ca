import type { Ok, Result } from "@mona-ca/core/result";
import type { UserCredentials } from "../../../../domain/entities/user-credentials";
import type {
	IdentityProviders,
	IdentityProvidersUserId,
	RawIdentityProviders,
} from "../../../../domain/value-objects/identity-providers";

export type PasswordIdentities = {
	enabled: boolean;
};

export type FederatedIdentity = {
	provider: IdentityProviders;
	providerUserId: IdentityProvidersUserId;
	linkedAt: Date;
};

export type FederatedIdentityMap = {
	[key in RawIdentityProviders]: FederatedIdentity | null;
};

type Success = Ok<{
	password: PasswordIdentities;
	federated: FederatedIdentityMap;
}>;

export type UserIdentitiesUseCaseResult = Result<Success>;

export interface IUserIdentitiesUseCase {
	execute(userCredentials: UserCredentials): Promise<UserIdentitiesUseCaseResult>;
}
