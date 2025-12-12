import type { UserId } from "../../../../../core/domain/value-objects";
import type { EmailVerificationRequest } from "../../../domain/entities/email-verification-request";
import type { EmailVerificationRequestId } from "../../../domain/value-objects/ids";

export interface IEmailVerificationRequestRepository {
	findById(id: EmailVerificationRequestId): Promise<EmailVerificationRequest | null>;

	save(emailVerificationRequest: EmailVerificationRequest): Promise<void>;

	deleteByUserId(userId: UserId): Promise<void>;

	deleteExpiredVerifications(): Promise<void>;
}
