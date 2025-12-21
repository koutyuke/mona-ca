import { eq, lte } from "drizzle-orm";
import { newUserId } from "../../../../../core/domain/value-objects";
import { newProviderLinkRequestId } from "../../../domain/value-objects/ids";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { DrizzleService } from "../../../../../core/infra/drizzle";
import type { IProviderLinkRequestRepository } from "../../../application/ports/out/repositories/provider-link-request.repository.interface";
import type { ProviderLinkRequest } from "../../../domain/entities/provider-link-request";
import { type RawIdentityProviders, newIdentityProviders } from "../../../domain/value-objects/identity-providers";
import type { ProviderLinkRequestId } from "../../../domain/value-objects/ids";

interface FoundProviderLinkRequestDto {
	id: string;
	userId: string;
	provider: RawIdentityProviders;
	secretHash: Buffer;
	expiresAt: Date;
}

export class ProviderLinkRequestRepository implements IProviderLinkRequestRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findById(id: ProviderLinkRequestId): Promise<ProviderLinkRequest | null> {
		const providerLinkRequests = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.providerLinkRequestsTable)
			.where(eq(this.drizzleService.schema.providerLinkRequestsTable.id, id));

		if (providerLinkRequests.length > 1) {
			throw new Error("Multiple provider link requests found for the same request id");
		}

		return providerLinkRequests.length === 1 ? this.convertToRequest(providerLinkRequests[0]!) : null;
	}

	public async save(request: ProviderLinkRequest): Promise<void> {
		await this.drizzleService.db
			.insert(this.drizzleService.schema.providerLinkRequestsTable)
			.values({
				id: request.id,
				userId: request.userId,
				provider: request.provider,
				secretHash: Buffer.from(request.secretHash),
				expiresAt: request.expiresAt,
			})
			.onConflictDoUpdate({
				target: this.drizzleService.schema.providerLinkRequestsTable.id,
				set: {
					expiresAt: request.expiresAt,
				},
			});
	}

	public async deleteById(id: ProviderLinkRequestId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.providerLinkRequestsTable)
			.where(eq(this.drizzleService.schema.providerLinkRequestsTable.id, id))
			.execute();
	}

	public async deleteByUserId(userId: UserId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.providerLinkRequestsTable)
			.where(eq(this.drizzleService.schema.providerLinkRequestsTable.userId, userId))
			.execute();
	}

	public async deleteExpiredRequests(): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.providerLinkRequestsTable)
			.where(lte(this.drizzleService.schema.providerLinkRequestsTable.expiresAt, new Date()))
			.execute();
	}

	private convertToRequest(dto: FoundProviderLinkRequestDto): ProviderLinkRequest {
		return {
			id: newProviderLinkRequestId(dto.id),
			userId: newUserId(dto.userId),
			provider: newIdentityProviders(dto.provider),
			secretHash: new Uint8Array(dto.secretHash),
			expiresAt: dto.expiresAt,
		};
	}
}
