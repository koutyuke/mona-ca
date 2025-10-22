import type { UserId } from "../../../../../core/domain/value-objects";
import type { PasswordResetSession } from "../../../domain/entities/password-reset-session";
import type { PasswordResetSessionId } from "../../../domain/value-objects/ids";

export type IPasswordResetSessionRepository = {
	findById: (id: PasswordResetSessionId) => Promise<PasswordResetSession | null>;
	save: (passwordResetSession: PasswordResetSession) => Promise<void>;
	deleteById: (id: PasswordResetSessionId) => Promise<void>;
	deleteByUserId: (userId: UserId) => Promise<void>;
};
