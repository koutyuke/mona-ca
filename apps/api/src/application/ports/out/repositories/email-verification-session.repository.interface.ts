import type { EmailVerificationSession } from "../../../../domain/entities";
import type { EmailVerificationSessionId, UserId } from "../../../../domain/value-object";

export interface IEmailVerificationSessionRepository {
	findById(id: EmailVerificationSessionId): Promise<EmailVerificationSession | null>;

	save(emailVerificationSession: EmailVerificationSession): Promise<void>;

	deleteByUserId(userId: UserId): Promise<void>;

	deleteExpiredVerifications(): Promise<void>;
}
