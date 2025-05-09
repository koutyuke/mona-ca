import type { PasswordResetSession } from "../../../../domain/entities";
import type { PasswordResetSessionId } from "../../../../domain/value-object";

export type IPasswordResetSessionRepository = {
	findById: (id: PasswordResetSessionId) => Promise<PasswordResetSession | null>;
	save: (passwordResetSession: PasswordResetSession) => Promise<void>;
	deleteByUserId: (userId: string) => Promise<void>;
};
