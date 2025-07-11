import type { EmailVerificationSession } from "../../../domain/entities";
import { isExpiredEmailVerificationSession } from "../../../domain/entities";
import type { EmailVerificationSessionId, UserId } from "../../../domain/value-object";
import type { IEmailVerificationSessionRepository } from "../../../interface-adapter/repositories/email-verification-session/interfaces/email-verification-session.repository.interface";

export class EmailVerificationSessionRepositoryMock implements IEmailVerificationSessionRepository {
	public emailVerificationSessionMap: Map<EmailVerificationSessionId, EmailVerificationSession>;

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
