import type { EmailVerification } from "../../../../domain/entities";
import type { UserId } from "../../../../domain/value-object";

export interface IEmailVerificationRepository {
	findByUserId(userId: UserId): Promise<EmailVerification | null>;

	save(emailVerification: EmailVerification): Promise<void>;

	deleteByUserId(userId: UserId): Promise<void>;

	deleteExpiredVerifications(): Promise<void>;
}
