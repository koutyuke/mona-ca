import { eq, lte } from "drizzle-orm";
import { newUserId } from "../../../../../core/domain/value-objects";
import { newProviderConnectionTicketId } from "../../../domain/value-objects/ids";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { DrizzleService } from "../../../../../core/infra/drizzle";
import type { IProviderConnectionTicketRepository } from "../../../application/ports/repositories/provider-connection-ticket.repository.interface";
import type { ProviderConnectionTicket } from "../../../domain/entities/provider-connection-ticket";
import type { ProviderConnectionTicketId } from "../../../domain/value-objects/ids";

interface FoundProviderConnectionTicketDto {
	id: string;
	userId: string;
	secretHash: Buffer;
	expiresAt: Date;
}

export class ProviderConnectionTicketRepository implements IProviderConnectionTicketRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findById(id: ProviderConnectionTicketId): Promise<ProviderConnectionTicket | null> {
		const providerConnectionTickets = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.providerConnectionTicketsTable)
			.where(eq(this.drizzleService.schema.providerConnectionTicketsTable.id, id));

		if (providerConnectionTickets.length > 1) {
			throw new Error("Multiple provider connection tickets found for the same ticket id");
		}

		return providerConnectionTickets.length === 1 ? this.convertToTicket(providerConnectionTickets[0]!) : null;
	}

	public async save(ticket: ProviderConnectionTicket): Promise<void> {
		await this.drizzleService.db
			.insert(this.drizzleService.schema.providerConnectionTicketsTable)
			.values({
				id: ticket.id,
				userId: ticket.userId,
				secretHash: Buffer.from(ticket.secretHash),
				expiresAt: ticket.expiresAt,
			})
			.onConflictDoUpdate({
				target: this.drizzleService.schema.providerConnectionTicketsTable.id,
				set: {
					expiresAt: ticket.expiresAt,
				},
			});
	}

	public async deleteById(id: ProviderConnectionTicketId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.providerConnectionTicketsTable)
			.where(eq(this.drizzleService.schema.providerConnectionTicketsTable.id, id))
			.execute();
	}

	public async deleteByUserId(userId: UserId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.providerConnectionTicketsTable)
			.where(eq(this.drizzleService.schema.providerConnectionTicketsTable.userId, userId))
			.execute();
	}

	public async deleteExpiredTickets(): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.providerConnectionTicketsTable)
			.where(lte(this.drizzleService.schema.providerConnectionTicketsTable.expiresAt, new Date()))
			.execute();
	}

	private convertToTicket(dto: FoundProviderConnectionTicketDto): ProviderConnectionTicket {
		return {
			id: newProviderConnectionTicketId(dto.id),
			userId: newUserId(dto.userId),
			secretHash: new Uint8Array(dto.secretHash),
			expiresAt: dto.expiresAt,
		};
	}
}
