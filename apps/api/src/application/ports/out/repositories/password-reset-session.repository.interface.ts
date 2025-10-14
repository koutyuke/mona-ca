import type { PasswordResetSession } from "../../../../domain/entities";
import type { PasswordResetSessionId, UserId } from "../../../../domain/value-objects";

export type IPasswordResetSessionRepository = {
	findById: (id: PasswordResetSessionId) => Promise<PasswordResetSession | null>;
	save: (passwordResetSession: PasswordResetSession) => Promise<void>;
	deleteById: (id: PasswordResetSessionId) => Promise<void>;
	deleteByUserId: (userId: UserId) => Promise<void>;
};
