import type { UserId } from "../../../../../core/domain/value-objects";
import type { IProviderConnectionTicketRepository } from "../../../application/ports/repositories/provider-connection-ticket.repository.interface";
import {
	type ProviderConnectionTicket,
	isExpiredProviderConnectionTicket,
} from "../../../domain/entities/provider-connection-ticket";
import type { ProviderConnectionTicketId } from "../../../domain/value-objects/ids";

export class ProviderConnectionTicketRepositoryMock implements IProviderConnectionTicketRepository {
	private readonly providerConnectionTicketMap: Map<ProviderConnectionTicketId, ProviderConnectionTicket>;

	constructor(maps: { providerConnectionTicketMap: Map<ProviderConnectionTicketId, ProviderConnectionTicket> }) {
		this.providerConnectionTicketMap = maps.providerConnectionTicketMap;
	}

	async findById(id: ProviderConnectionTicketId): Promise<ProviderConnectionTicket | null> {
		return this.providerConnectionTicketMap.get(id) || null;
	}

	async save(ticket: ProviderConnectionTicket): Promise<void> {
		this.providerConnectionTicketMap.set(ticket.id, ticket);
	}

	async deleteById(id: ProviderConnectionTicketId): Promise<void> {
		this.providerConnectionTicketMap.delete(id);
	}

	async deleteByUserId(userId: UserId): Promise<void> {
		for (const [ticketId, ticket] of this.providerConnectionTicketMap.entries()) {
			if (ticket.userId === userId) {
				this.providerConnectionTicketMap.delete(ticketId);
			}
		}
	}

	async deleteExpiredTickets(): Promise<void> {
		for (const [ticketId, ticket] of this.providerConnectionTicketMap.entries()) {
			if (isExpiredProviderConnectionTicket(ticket)) {
				this.providerConnectionTicketMap.delete(ticketId);
			}
		}
	}
}
