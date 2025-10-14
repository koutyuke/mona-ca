import type { ToPrimitive } from "@mona-ca/core/utils";
import { eq, lte } from "drizzle-orm";
import type { IAccountAssociationSessionRepository } from "../../../application/ports/out/repositories";
import type { AccountAssociationSession } from "../../../domain/entities";
import {
	type AccountAssociationSessionId,
	type ExternalIdentityProvider,
	type UserId,
	newAccountAssociationSessionId,
	newExternalIdentityProvider,
	newExternalIdentityProviderUserId,
	newUserId,
} from "../../../domain/value-object";
import type { DrizzleService } from "../../../infrastructure/drizzle";

interface FoundAccountAssociationSessionDto {
	id: string;
	userId: string;
	code: string | null;
	secretHash: Buffer;
	email: string;
	provider: ToPrimitive<ExternalIdentityProvider>;
	providerUserId: string;
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
		await this.drizzleService.db.insert(this.drizzleService.schema.accountAssociationSessions).values({
			...session,
			secretHash: Buffer.from(session.secretHash),
		});
	}

	public async deleteById(sessionId: AccountAssociationSessionId): Promise<void> {
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
			secretHash: new Uint8Array(dto.secretHash),
			email: dto.email,
			provider: newExternalIdentityProvider(dto.provider),
			providerUserId: newExternalIdentityProviderUserId(dto.providerUserId),
			expiresAt: dto.expiresAt,
		};
	}
}
