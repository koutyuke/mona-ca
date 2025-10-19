import type { UserId } from "../../../../../shared/domain/value-objects";
import type { EmailVerificationSession } from "../../../domain/entities/email-verification-session";
import type { EmailVerificationSessionId } from "../../../domain/value-objects/ids";

export interface IEmailVerificationSessionRepository {
	findById(id: EmailVerificationSessionId): Promise<EmailVerificationSession | null>;

	save(emailVerificationSession: EmailVerificationSession): Promise<void>;

	deleteByUserId(userId: UserId): Promise<void>;

	deleteExpiredVerifications(): Promise<void>;
}
