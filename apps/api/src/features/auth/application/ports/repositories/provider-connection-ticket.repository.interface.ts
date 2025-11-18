import type { UserId } from "../../../../../core/domain/value-objects";
import type { ProviderConnectionTicket } from "../../../domain/entities/provider-connection-ticket";
import type { ProviderConnectionTicketId } from "../../../domain/value-objects/ids";

export interface IProviderConnectionTicketRepository {
	findById(id: ProviderConnectionTicketId): Promise<ProviderConnectionTicket | null>;

	save(ticket: ProviderConnectionTicket): Promise<void>;

	deleteById(id: ProviderConnectionTicketId): Promise<void>;

	deleteByUserId(userId: UserId): Promise<void>;

	deleteExpiredTickets(): Promise<void>;
}
