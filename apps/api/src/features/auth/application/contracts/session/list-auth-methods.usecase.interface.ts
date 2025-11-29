import type { Ok, Result } from "@mona-ca/core/utils";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type {
	IdentityProviders,
	IdentityProvidersUserId,
	RawIdentityProviders,
} from "../../../domain/value-objects/identity-providers";

export type PasswordAuthConnection = {
	enabled: boolean;
};

export type FederatedProviderConnection = {
	provider: IdentityProviders;
	providerUserId: IdentityProvidersUserId;
	linkedAt: Date;
};

export type FederatedConnections = {
	[key in RawIdentityProviders]: FederatedProviderConnection | null;
};

type Success = Ok<{
	password: PasswordAuthConnection;
	federated: FederatedConnections;
}>;

export type ListAuthMethodsUseCaseResult = Result<Success>;

export interface IListAuthMethodsUseCase {
	execute(userCredentials: UserCredentials): Promise<ListAuthMethodsUseCaseResult>;
}
