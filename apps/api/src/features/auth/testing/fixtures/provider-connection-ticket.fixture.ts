import { newUserId } from "../../../../core/domain/value-objects";
import { ulid } from "../../../../core/lib/id";
import { TokenSecretServiceMock } from "../../../../core/testing/mocks/system";
import {
	type ProviderConnectionTicket,
	providerConnectionTicketExpiresSpan,
} from "../../domain/entities/provider-connection-ticket";
import { newProviderConnectionTicketId } from "../../domain/value-objects/ids";
import { type ProviderConnectionTicketToken, encodeToken } from "../../domain/value-objects/tokens";

const tokenSecretService = new TokenSecretServiceMock();

export const createProviderConnectionTicketFixture = (override?: {
	secretHasher?: (secret: string) => Uint8Array;
	providerConnectionTicket?: Partial<ProviderConnectionTicket>;
	providerConnectionTicketSecret?: string;
}): {
	providerConnectionTicket: ProviderConnectionTicket;
	providerConnectionSecret: string;
	providerConnectionToken: ProviderConnectionTicketToken;
} => {
	const secretHasher = override?.secretHasher ?? tokenSecretService.hash;

	const secret = override?.providerConnectionTicketSecret ?? "providerConnectionTicketSecret";
	const secretHash = secretHasher(secret);

	const expiresAt = new Date(
		override?.providerConnectionTicket?.expiresAt?.getTime() ??
			Date.now() + providerConnectionTicketExpiresSpan.milliseconds(),
	);
	expiresAt.setMilliseconds(0);

	const ticket: ProviderConnectionTicket = {
		id: newProviderConnectionTicketId(ulid()),
		userId: newUserId(ulid()),
		secretHash: secretHash,
		expiresAt,
		...override?.providerConnectionTicket,
	} satisfies ProviderConnectionTicket;

	return {
		providerConnectionTicket: ticket,
		providerConnectionSecret: secret,
		providerConnectionToken: encodeToken(ticket.id, secret),
	};
};
