import { eq, lte } from "drizzle-orm";
import { newUserId } from "../../../../../core/domain/value-objects";
import { newIdentityProviders, newIdentityProvidersUserId } from "../../../domain/value-objects/identity-providers";
import { newAccountLinkSessionId } from "../../../domain/value-objects/ids";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { DrizzleService } from "../../../../../core/infra/drizzle";
import type { IAccountLinkSessionRepository } from "../../../application/ports/repositories/account-link-session.repository.interface";
import type { AccountLinkSession } from "../../../domain/entities/account-link-session";
import type { RawIdentityProviders } from "../../../domain/value-objects/identity-providers";
import type { AccountLinkSessionId } from "../../../domain/value-objects/ids";

interface FoundAccountLinkSessionDto {
	id: string;
	userId: string;
	code: string | null;
	secretHash: Buffer;
	email: string;
	provider: RawIdentityProviders;
	providerUserId: string;
	expiresAt: Date;
}

export class AccountLinkSessionRepository implements IAccountLinkSessionRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findById(sessionId: AccountLinkSessionId): Promise<AccountLinkSession | null> {
		const sessions = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.accountLinkSessionsTable)
			.where(eq(this.drizzleService.schema.accountLinkSessionsTable.id, sessionId));

		if (sessions.length > 1) {
			throw new Error("Multiple sessions found for the same session id");
		}

		return sessions.length === 1 ? this.convertToSession(sessions[0]!) : null;
	}

	public async save(session: AccountLinkSession): Promise<void> {
		await this.drizzleService.db.insert(this.drizzleService.schema.accountLinkSessionsTable).values({
			...session,
			secretHash: Buffer.from(session.secretHash),
		});
	}

	public async deleteById(sessionId: AccountLinkSessionId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.accountLinkSessionsTable)
			.where(eq(this.drizzleService.schema.accountLinkSessionsTable.id, sessionId))
			.execute();
	}

	public async deleteExpiredSessions(): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.accountLinkSessionsTable)
			.where(lte(this.drizzleService.schema.accountLinkSessionsTable.expiresAt, new Date()))
			.execute();
	}

	public async deleteByUserId(userId: UserId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.accountLinkSessionsTable)
			.where(eq(this.drizzleService.schema.accountLinkSessionsTable.userId, userId))
			.execute();
	}

	private convertToSession(dto: FoundAccountLinkSessionDto): AccountLinkSession {
		return {
			id: newAccountLinkSessionId(dto.id),
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
