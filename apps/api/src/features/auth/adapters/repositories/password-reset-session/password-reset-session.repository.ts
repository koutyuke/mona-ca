import { eq } from "drizzle-orm";
import { newUserId } from "../../../../../core/domain/value-objects";
import { newPasswordResetSessionId } from "../../../domain/value-objects/ids";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { DrizzleService } from "../../../../../core/infra/drizzle";
import type { IPasswordResetSessionRepository } from "../../../application/ports/repositories/password-reset-session.repository.interface";
import type { PasswordResetSession } from "../../../domain/entities/password-reset-session";
import type { PasswordResetSessionId } from "../../../domain/value-objects/ids";

interface FoundPasswordResetSessionDto {
	id: string;
	userId: string;
	code: string;
	secretHash: Buffer;
	email: string;
	emailVerified: boolean;
	expiresAt: Date;
}

export class PasswordResetSessionRepository implements IPasswordResetSessionRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findById(id: PasswordResetSessionId): Promise<PasswordResetSession | null> {
		const passwordResetSessions = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.passwordResetSessions)
			.where(eq(this.drizzleService.schema.passwordResetSessions.id, id));

		if (passwordResetSessions.length > 1) {
			throw new Error("Multiple password reset sessions found for the same id");
		}

		return passwordResetSessions.length === 1 ? this.convertToPasswordResetSession(passwordResetSessions[0]!) : null;
	}

	public async save(passwordResetSession: PasswordResetSession): Promise<void> {
		await this.drizzleService.db
			.insert(this.drizzleService.schema.passwordResetSessions)
			.values({
				id: passwordResetSession.id,
				userId: passwordResetSession.userId,
				code: passwordResetSession.code,
				secretHash: Buffer.from(passwordResetSession.secretHash),
				email: passwordResetSession.email,
				emailVerified: passwordResetSession.emailVerified,
				expiresAt: passwordResetSession.expiresAt,
			})
			.onConflictDoUpdate({
				target: this.drizzleService.schema.passwordResetSessions.id,
				set: {
					emailVerified: passwordResetSession.emailVerified,
					expiresAt: passwordResetSession.expiresAt,
				},
			});
	}

	public async deleteById(id: PasswordResetSessionId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.passwordResetSessions)
			.where(eq(this.drizzleService.schema.passwordResetSessions.id, id))
			.execute();
	}

	public async deleteByUserId(userId: UserId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.passwordResetSessions)
			.where(eq(this.drizzleService.schema.passwordResetSessions.userId, userId))
			.execute();
	}

	private convertToPasswordResetSession(dto: FoundPasswordResetSessionDto): PasswordResetSession {
		return {
			id: newPasswordResetSessionId(dto.id),
			userId: newUserId(dto.userId),
			code: dto.code,
			secretHash: new Uint8Array(dto.secretHash),
			email: dto.email,
			emailVerified: dto.emailVerified,
			expiresAt: dto.expiresAt,
		};
	}
}
