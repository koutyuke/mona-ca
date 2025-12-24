import type { Ok, Result } from "@mona-ca/core/result";
import type { UserCredentials } from "../../../../domain/entities/user-credentials";
import type { IdentityProviders, IdentityProvidersUserId } from "../../../../domain/value-objects/identity-providers";

export type PasswordIdentity = {
	enabled: boolean;
};

export type FederatedIdentities = {
	provider: IdentityProviders;
	providerUserId: IdentityProvidersUserId;
	linkedAt: Date;
}[];

export type UserIdentities = {
	password: PasswordIdentity;
	federated: FederatedIdentities;
};

type Success = Ok<UserIdentities>;

export type UserIdentitiesUseCaseResult = Result<Success>;

export interface IUserIdentitiesUseCase {
	execute(userCredentials: UserCredentials): Promise<UserIdentitiesUseCaseResult>;
}
