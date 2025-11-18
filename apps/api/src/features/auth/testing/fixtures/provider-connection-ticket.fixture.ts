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
	ticket?: Partial<ProviderConnectionTicket>;
	secret?: string;
}): {
	ticket: ProviderConnectionTicket;
	secret: string;
	token: ProviderConnectionTicketToken;
} => {
	const secretHasher = override?.secretHasher ?? tokenSecretService.hash;

	const secret = override?.secret ?? "providerConnectionTicketSecret";
	const secretHash = secretHasher(secret);

	const expiresAt = new Date(
		override?.ticket?.expiresAt?.getTime() ?? Date.now() + providerConnectionTicketExpiresSpan.milliseconds(),
	);
	expiresAt.setMilliseconds(0);

	const ticket: ProviderConnectionTicket = {
		id: newProviderConnectionTicketId(ulid()),
		userId: newUserId(ulid()),
		secretHash: secretHash,
		expiresAt,
		...override?.ticket,
	} satisfies ProviderConnectionTicket;

	return {
		ticket,
		secret,
		token: encodeToken(ticket.id, secret),
	};
};
