import type { ToPrimitive } from "@mona-ca/core/utils";
import type { AccountConnections } from "../../application/contracts/account-link/get-connections.usecase.interface";
import type { ExternalIdentityProvider } from "../../domain/value-objects/external-identity";

type ProviderConnection = {
	provider: string;
	providerUserId: string;
	linkedAt: string;
} | null;

type PrimitiveProvider = ToPrimitive<ExternalIdentityProvider>;

type AccountConnectionsResponse = {
	password: boolean;
	discord: ProviderConnection | null;
	google: ProviderConnection | null;
};

export const toAccountConnectionsResponse = (connections: AccountConnections): AccountConnectionsResponse => {
	const { password, ...providers } = connections;

	const formattedProviders: { [key in PrimitiveProvider]: ProviderConnection | null } = {
		discord: null,
		google: null,
	};

	for (const [provider, connection] of Object.entries(providers)) {
		if (connection) {
			formattedProviders[provider as PrimitiveProvider] = {
				provider: connection.provider,
				providerUserId: connection.providerUserId,
				linkedAt: connection.linkedAt.toISOString(),
			};
		} else {
			formattedProviders[provider as PrimitiveProvider] = null;
		}
	}

	return {
		password,
		discord: formattedProviders.discord,
		google: formattedProviders.google,
	};
};
