import { eq } from "drizzle-orm";
import { PasswordResetSession } from "../../../domain/entities/password-reset-session";
import { type PasswordResetSessionId, newPasswordResetSessionId, newUserId } from "../../../domain/value-object";
import type { DrizzleService } from "../../../infrastructure/drizzle";
import type { IPasswordResetSessionRepository } from "./interfaces/password-reset-session.repository.interface";

interface FoundPasswordResetSessionDto {
	id: string;
	userId: string;
	code: string;
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
				email: passwordResetSession.email,
				emailVerified: passwordResetSession.emailVerified,
				expiresAt: passwordResetSession.expiresAt,
			})
			.onConflictDoUpdate({
				target: this.drizzleService.schema.passwordResetSessions.id,
				set: {
					userId: passwordResetSession.userId,
					code: passwordResetSession.code,
					email: passwordResetSession.email,
					emailVerified: passwordResetSession.emailVerified,
					expiresAt: passwordResetSession.expiresAt,
				},
			});
	}

	public async deleteByUserId(userId: string): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.passwordResetSessions)
			.where(eq(this.drizzleService.schema.passwordResetSessions.userId, userId));
	}

	private convertToPasswordResetSession(dto: FoundPasswordResetSessionDto): PasswordResetSession {
		return new PasswordResetSession({
			id: newPasswordResetSessionId(dto.id),
			userId: newUserId(dto.userId),
			code: dto.code,
			email: dto.email,
			emailVerified: dto.emailVerified,
			expiresAt: dto.expiresAt,
		});
	}
}
