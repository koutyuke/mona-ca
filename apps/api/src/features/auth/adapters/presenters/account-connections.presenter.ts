import type { ToPrimitive } from "@mona-ca/core/utils";
import { type Static, t } from "elysia";
import type {
	ExternalIdentityProvider,
	ExternalIdentityProviderUserId,
} from "../../domain/value-objects/external-identity";

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

export const toAccountConnectionsResponse = (
	connections: {
		password: boolean;
	} & {
		[key in ToPrimitive<ExternalIdentityProvider>]: {
			provider: ExternalIdentityProvider;
			providerUserId: ExternalIdentityProviderUserId;
			linkedAt: Date;
		} | null;
	},
): AccountConnectionsResponse => {
	const { password, ...providers } = connections;

	const formattedProviders: Record<string, ProviderConnection> = {};

	for (const [provider, connection] of Object.entries(providers)) {
		if (connection) {
			formattedProviders[provider] = {
				provider: connection.provider,
				providerUserId: connection.providerUserId,
				linkedAt: connection.linkedAt.toISOString(),
			};
		} else {
			formattedProviders[provider] = null;
		}
	}

	return {
		password,
		discord: formattedProviders.discord || null,
		google: formattedProviders.google || null,
	};
};
