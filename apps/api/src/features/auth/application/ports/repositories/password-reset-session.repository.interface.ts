import type { PasswordResetSessionId, UserId } from "../../../../common/domain/value-objects";
import type { PasswordResetSession } from "../../../../domain/entities";

export type IPasswordResetSessionRepository = {
	findById: (id: PasswordResetSessionId) => Promise<PasswordResetSession | null>;
	save: (passwordResetSession: PasswordResetSession) => Promise<void>;
	deleteById: (id: PasswordResetSessionId) => Promise<void>;
	deleteByUserId: (userId: UserId) => Promise<void>;
};
