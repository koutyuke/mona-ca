import { type Static, t } from "elysia";
import type { GetConnectionsUseCaseSuccessResult } from "../../application/use-cases/account-link/interfaces/get-connections.usecase.interface";

export const AccountConnectionsPresenterResultSchema = t.Composite([
	t.Object({
		password: t.Boolean(),
	}),
	t.Mapped(t.Union([t.Literal("discord")]), () =>
		t.Nullable(
			t.Object({
				provider: t.String(),
				providerId: t.String(),
				linkedAt: t.String({
					format: "date-time",
				}),
			}),
		),
	),
]);

export type AccountConnectionsPresenterResult = Static<typeof AccountConnectionsPresenterResultSchema>;

type ProviderConnection = {
	provider: string;
	providerId: string;
	linkedAt: string;
} | null;

export const AccountConnectionsPresenter = (
	connections: GetConnectionsUseCaseSuccessResult,
): AccountConnectionsPresenterResult => {
	const { password, ...providers } = connections;

	const formattedProviders: Record<string, ProviderConnection> = {};

	for (const [provider, connection] of Object.entries(providers)) {
		if (connection) {
			formattedProviders[provider] = {
				provider: connection.provider,
				providerId: connection.providerId,
				linkedAt: connection.linkedAt.toISOString(),
			};
		} else {
			formattedProviders[provider] = null;
		}
	}

	return {
		password,
		discord: formattedProviders.discord || null,
	};
};
