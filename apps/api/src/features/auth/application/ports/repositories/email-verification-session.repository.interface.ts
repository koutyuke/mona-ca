import type { EmailVerificationSessionId, UserId } from "../../../../common/domain/value-objects";
import type { EmailVerificationSession } from "../../../../domain/entities";

export interface IEmailVerificationSessionRepository {
	findById(id: EmailVerificationSessionId): Promise<EmailVerificationSession | null>;

	save(emailVerificationSession: EmailVerificationSession): Promise<void>;

	deleteByUserId(userId: UserId): Promise<void>;

	deleteExpiredVerifications(): Promise<void>;
}
