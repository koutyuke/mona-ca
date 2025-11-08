import { eq, lte } from "drizzle-orm";
import { newUserId } from "../../../../../core/domain/value-objects";
import { newAccountLinkSessionId } from "../../../domain/value-objects/ids";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { DrizzleService } from "../../../../../core/infra/drizzle";
import type { IAccountLinkSessionRepository } from "../../../application/ports/repositories/account-link-session.repository.interface";
import type { AccountLinkSession } from "../../../domain/entities/account-link-session";
import type { AccountLinkSessionId } from "../../../domain/value-objects/ids";

interface FoundAccountLinkSessionDto {
	id: string;
	userId: string;
	secretHash: Buffer;
	expiresAt: Date;
}

export class AccountLinkSessionRepository implements IAccountLinkSessionRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findById(id: AccountLinkSessionId): Promise<AccountLinkSession | null> {
		const accountLinkSessions = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.accountLinkSessions)
			.where(eq(this.drizzleService.schema.accountLinkSessions.id, id));

		if (accountLinkSessions.length > 1) {
			throw new Error("Multiple account link sessions found for the same session id");
		}

		return accountLinkSessions.length === 1 ? this.convertToSession(accountLinkSessions[0]!) : null;
	}

	public async save(session: AccountLinkSession): Promise<void> {
		await this.drizzleService.db
			.insert(this.drizzleService.schema.accountLinkSessions)
			.values({
				id: session.id,
				userId: session.userId,
				secretHash: Buffer.from(session.secretHash),
				expiresAt: session.expiresAt,
			})
			.onConflictDoUpdate({
				target: this.drizzleService.schema.accountLinkSessions.id,
				set: {
					userId: session.userId,
					secretHash: Buffer.from(session.secretHash),
					expiresAt: session.expiresAt,
				},
			});
	}

	public async deleteById(id: AccountLinkSessionId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.accountLinkSessions)
			.where(eq(this.drizzleService.schema.accountLinkSessions.id, id))
			.execute();
	}

	public async deleteByUserId(userId: UserId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.accountLinkSessions)
			.where(eq(this.drizzleService.schema.accountLinkSessions.userId, userId))
			.execute();
	}

	public async deleteExpiredSessions(): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.accountLinkSessions)
			.where(lte(this.drizzleService.schema.accountLinkSessions.expiresAt, new Date()))
			.execute();
	}

	private convertToSession(dto: FoundAccountLinkSessionDto): AccountLinkSession {
		return {
			id: newAccountLinkSessionId(dto.id),
			userId: newUserId(dto.userId),
			secretHash: new Uint8Array(dto.secretHash),
			expiresAt: dto.expiresAt,
		};
	}
}
