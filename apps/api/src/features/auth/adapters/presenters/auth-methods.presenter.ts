import type { ListAuthMethodsUseCaseResult } from "../../application/ports/in/session/list-auth-methods.usecase.interface";
import type { RawIdentityProviders } from "../../domain/value-objects/identity-providers";

type PasswordAuthConnection = {
	enabled: boolean;
};

type FederatedProviderConnection = {
	provider: string;
	providerUserId: string;
	linkedAt: string;
};

type FederatedConnections = {
	[key in RawIdentityProviders]: FederatedProviderConnection | null;
};

type AuthMethodsResponse = {
	password: PasswordAuthConnection;
	federated: FederatedConnections;
};

export const toAuthMethodsResponse = (authMethods: ListAuthMethodsUseCaseResult): AuthMethodsResponse => {
	const { password, federated } = authMethods.value;

	const formattedPassword: PasswordAuthConnection = {
		enabled: password.enabled,
	};

	const formattedFederated: FederatedConnections = {
		discord: null,
		google: null,
	};

	for (const [provider, connection] of Object.entries(federated)) {
		if (connection) {
			formattedFederated[provider as RawIdentityProviders] = {
				provider: connection.provider,
				providerUserId: connection.providerUserId,
				linkedAt: connection.linkedAt.toISOString(),
			};
		}
	}

	return {
		password: formattedPassword,
		federated: formattedFederated,
	};
};
