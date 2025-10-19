import type { ToPrimitive } from "@mona-ca/core/utils";
import { type Static, t } from "elysia";
import type { AccountConnections } from "../../application/contracts/account-link/get-connections.usecase.interface";
import type { ExternalIdentityProvider } from "../../domain/value-objects/external-identity";

export const AccountConnectionsResponseSchema = t.Composite([
	t.Object({
		password: t.Boolean(),
	}),
	t.Mapped(t.Union([t.Literal("discord"), t.Literal("google")]), () =>
		t.Nullable(
			t.Object({
				provider: t.String(),
				providerUserId: t.String(),
				linkedAt: t.String({
					format: "date-time",
				}),
			}),
		),
	),
]);

export type AccountConnectionsResponse = Static<typeof AccountConnectionsResponseSchema>;

type ProviderConnection = {
	provider: string;
	providerUserId: string;
	linkedAt: string;
} | null;

type PrimitiveProvider = ToPrimitive<ExternalIdentityProvider>;

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
