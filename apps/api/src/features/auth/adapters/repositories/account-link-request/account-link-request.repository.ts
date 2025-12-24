import { eq, lte } from "drizzle-orm";
import { newUserId } from "../../../../../core/domain/value-objects";
import { newIdentityProviders, newIdentityProvidersUserId } from "../../../domain/value-objects/identity-providers";
import { newAccountLinkRequestId } from "../../../domain/value-objects/ids";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { DrizzleService } from "../../../../../core/infra/drizzle";
import type { IAccountLinkRequestRepository } from "../../../application/ports/out/repositories/account-link-request.repository.interface";
import type { AccountLinkRequest } from "../../../domain/entities/account-link-request";
import type { RawIdentityProviders } from "../../../domain/value-objects/identity-providers";
import type { AccountLinkRequestId } from "../../../domain/value-objects/ids";

interface FoundAccountLinkRequestDto {
	id: string;
	userId: string;
	code: string | null;
	secretHash: Buffer;
	email: string;
	provider: RawIdentityProviders;
	providerUserId: string;
	expiresAt: Date;
}

export class AccountLinkRequestRepository implements IAccountLinkRequestRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findById(requestId: AccountLinkRequestId): Promise<AccountLinkRequest | null> {
		const requests = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.accountLinkRequestsTable)
			.where(eq(this.drizzleService.schema.accountLinkRequestsTable.id, requestId));

		if (requests.length > 1) {
			throw new Error("Multiple requests found for the same request id");
		}

		return requests.length === 1 ? this.convertToRequest(requests[0]!) : null;
	}

	public async save(request: AccountLinkRequest): Promise<void> {
		await this.drizzleService.db.insert(this.drizzleService.schema.accountLinkRequestsTable).values({
			...request,
			secretHash: Buffer.from(request.secretHash),
		});
	}

	public async deleteById(requestId: AccountLinkRequestId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.accountLinkRequestsTable)
			.where(eq(this.drizzleService.schema.accountLinkRequestsTable.id, requestId))
			.execute();
	}

	public async deleteExpiredRequests(): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.accountLinkRequestsTable)
			.where(lte(this.drizzleService.schema.accountLinkRequestsTable.expiresAt, new Date()))
			.execute();
	}

	public async deleteByUserId(userId: UserId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.accountLinkRequestsTable)
			.where(eq(this.drizzleService.schema.accountLinkRequestsTable.userId, userId))
			.execute();
	}

	private convertToRequest(dto: FoundAccountLinkRequestDto): AccountLinkRequest {
		return {
			id: newAccountLinkRequestId(dto.id),
			userId: newUserId(dto.userId),
			code: dto.code,
			secretHash: new Uint8Array(dto.secretHash),
			email: dto.email,
			provider: newIdentityProviders(dto.provider),
			providerUserId: newIdentityProvidersUserId(dto.providerUserId),
			expiresAt: dto.expiresAt,
		};
	}
}
