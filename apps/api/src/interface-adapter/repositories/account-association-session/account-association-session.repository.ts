import { eq, lte } from "drizzle-orm";
import type { AccountAssociationSession } from "../../../domain/entities";
import {
	type AccountAssociationSessionId,
	type UserId,
	newAccountAssociationSessionId,
	newOAuthProvider,
	newOAuthProviderId,
	newUserId,
} from "../../../domain/value-object";
import type { DrizzleService } from "../../../infrastructure/drizzle";
import type { IAccountAssociationSessionRepository } from "./interfaces/account-association-session.repository.interface";

interface FoundAccountAssociationSessionDto {
	id: string;
	userId: string;
	code: string;
	email: string;
	emailVerified: boolean;
	provider: "discord";
	providerId: string;
	expiresAt: Date;
}

export class AccountAssociationSessionRepository implements IAccountAssociationSessionRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findById(sessionId: AccountAssociationSessionId): Promise<AccountAssociationSession | null> {
		const sessions = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.accountAssociationSessions)
			.where(eq(this.drizzleService.schema.accountAssociationSessions.id, sessionId));

		if (sessions.length > 1) {
			throw new Error("Multiple sessions found for the same session id");
		}

		return sessions.length === 1 ? this.convertToSession(sessions[0]!) : null;
	}

	public async save(session: AccountAssociationSession): Promise<void> {
		await this.drizzleService.db
			.insert(this.drizzleService.schema.accountAssociationSessions)
			.values(session)
			.onConflictDoUpdate({
				target: this.drizzleService.schema.accountAssociationSessions.id,
				set: {
					emailVerified: session.emailVerified,
					expiresAt: session.expiresAt,
				},
			});
	}

	public async delete(sessionId: AccountAssociationSessionId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.accountAssociationSessions)
			.where(eq(this.drizzleService.schema.accountAssociationSessions.id, sessionId))
			.execute();
	}

	public async deleteExpiredSessions(): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.accountAssociationSessions)
			.where(lte(this.drizzleService.schema.accountAssociationSessions.expiresAt, new Date()))
			.execute();
	}

	public async deleteByUserId(userId: UserId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.accountAssociationSessions)
			.where(eq(this.drizzleService.schema.accountAssociationSessions.userId, userId))
			.execute();
	}

	private convertToSession(dto: FoundAccountAssociationSessionDto): AccountAssociationSession {
		return {
			id: newAccountAssociationSessionId(dto.id),
			userId: newUserId(dto.userId),
			code: dto.code,
			email: dto.email,
			emailVerified: dto.emailVerified,
			provider: newOAuthProvider(dto.provider),
			providerId: newOAuthProviderId(dto.providerId),
			expiresAt: dto.expiresAt,
		} satisfies AccountAssociationSession;
	}
}
