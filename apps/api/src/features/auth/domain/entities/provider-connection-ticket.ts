import type { UserId } from "../../../../core/domain/value-objects";
import { TimeSpan } from "../../../../core/lib/time";
import type { ProviderConnectionTicketId } from "../value-objects/ids";

export const PROVIDER_CONNECTION_TICKET_EXPIRES_SPAN_MINUTES = 3 as const;

export const providerConnectionTicketExpiresSpan = new TimeSpan(PROVIDER_CONNECTION_TICKET_EXPIRES_SPAN_MINUTES, "m");

export interface ProviderConnectionTicket {
	id: ProviderConnectionTicketId;
	userId: UserId;
	secretHash: Uint8Array;
	expiresAt: Date;
}

export const createProviderConnectionTicket = (args: {
	id: ProviderConnectionTicketId;
	userId: UserId;
	secretHash: Uint8Array;
}): ProviderConnectionTicket => {
	return {
		id: args.id,
		userId: args.userId,
		secretHash: args.secretHash,
		expiresAt: new Date(Date.now() + providerConnectionTicketExpiresSpan.milliseconds()),
	};
};

export const isExpiredProviderConnectionTicket = (ticket: ProviderConnectionTicket): boolean => {
	return ticket.expiresAt.getTime() < Date.now();
};
