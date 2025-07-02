import { eq, lte } from "drizzle-orm";
import type { EmailVerificationSession } from "../../../domain/entities/email-verification-session";
import {
	type EmailVerificationSessionId,
	type UserId,
	newEmailVerificationSessionId,
	newUserId,
} from "../../../domain/value-object";
import type { DrizzleService } from "../../../infrastructure/drizzle";
import type { IEmailVerificationSessionRepository } from "./interfaces/email-verification-session.repository.interface";

interface FoundEmailVerificationSessionDto {
	id: string;
	email: string;
	userId: string;
	code: string;
	secretHash: Buffer;
	expiresAt: Date;
}

type InsertEmailVerificationSession = Omit<EmailVerificationSession, "secretHash"> & { secretHash: Buffer };

export class EmailVerificationSessionRepository implements IEmailVerificationSessionRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findById(id: EmailVerificationSessionId): Promise<EmailVerificationSession | null> {
		const emailVerificationSessions = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.emailVerificationSessions)
			.where(eq(this.drizzleService.schema.emailVerificationSessions.id, id));

		if (emailVerificationSessions.length > 1) {
			throw new Error("Multiple email verifications found for the same user id");
		}

		return emailVerificationSessions.length === 1
			? this.convertToEmailVerificationSession(emailVerificationSessions[0]!)
			: null;
	}

	public async save(emailVerificationSession: EmailVerificationSession): Promise<void> {
		await this.drizzleService.db
			.insert(this.drizzleService.schema.emailVerificationSessions)
			.values(this.convertToInsertEmailVerificationSession(emailVerificationSession))
			.onConflictDoUpdate({
				target: this.drizzleService.schema.emailVerificationSessions.id,
				set: {
					email: emailVerificationSession.email,
					userId: emailVerificationSession.userId,
					code: emailVerificationSession.code,
					secretHash: Buffer.from(emailVerificationSession.secretHash),
					expiresAt: emailVerificationSession.expiresAt,
				},
			});
	}

	public async deleteByUserId(userId: UserId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.emailVerificationSessions)
			.where(eq(this.drizzleService.schema.emailVerificationSessions.userId, userId));
	}

	public async deleteExpiredVerifications(): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.emailVerificationSessions)
			.where(lte(this.drizzleService.schema.emailVerificationSessions.expiresAt, new Date()));
	}

	private convertToEmailVerificationSession(dto: FoundEmailVerificationSessionDto): EmailVerificationSession {
		return {
			id: newEmailVerificationSessionId(dto.id),
			email: dto.email,
			userId: newUserId(dto.userId),
			code: dto.code,
			secretHash: new Uint8Array(dto.secretHash),
			expiresAt: dto.expiresAt,
		} satisfies EmailVerificationSession;
	}

	private convertToInsertEmailVerificationSession(session: EmailVerificationSession): InsertEmailVerificationSession {
		return {
			id: session.id,
			email: session.email,
			userId: session.userId,
			code: session.code,
			secretHash: Buffer.from(session.secretHash),
			expiresAt: session.expiresAt,
		};
	}
}
