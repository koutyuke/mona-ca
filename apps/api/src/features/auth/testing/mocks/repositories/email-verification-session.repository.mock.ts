import type { UserId } from "../../../../../shared/domain/value-objects";
import type { IEmailVerificationSessionRepository } from "../../../application/ports/repositories/email-verification-session.repository.interface";
import {
	type EmailVerificationSession,
	isExpiredEmailVerificationSession,
} from "../../../domain/entities/email-verification-session";
import type { EmailVerificationSessionId } from "../../../domain/value-objects/ids";

export class EmailVerificationSessionRepositoryMock implements IEmailVerificationSessionRepository {
	private readonly emailVerificationSessionMap: Map<EmailVerificationSessionId, EmailVerificationSession>;

	constructor(maps: {
		emailVerificationSessionMap: Map<EmailVerificationSessionId, EmailVerificationSession>;
	}) {
		this.emailVerificationSessionMap = maps.emailVerificationSessionMap;
	}

	async findById(id: EmailVerificationSessionId): Promise<EmailVerificationSession | null> {
		return this.emailVerificationSessionMap.get(id) || null;
	}

	async save(emailVerificationSession: EmailVerificationSession): Promise<void> {
		this.emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);
	}

	async deleteByUserId(userId: UserId): Promise<void> {
		for (const [sessionId, session] of this.emailVerificationSessionMap.entries()) {
			if (session.userId === userId) {
				this.emailVerificationSessionMap.delete(sessionId);
			}
		}
	}

	async deleteExpiredVerifications(): Promise<void> {
		for (const [sessionId, session] of this.emailVerificationSessionMap.entries()) {
			if (isExpiredEmailVerificationSession(session)) {
				this.emailVerificationSessionMap.delete(sessionId);
			}
		}
	}
}
