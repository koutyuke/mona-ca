import type { UserId } from "../../../../../core/domain/value-objects";
import type { IPasswordResetSessionRepository } from "../../../application/ports/repositories/password-reset-session.repository.interface";
import type { PasswordResetSession } from "../../../domain/entities/password-reset-session";
import type { PasswordResetSessionId } from "../../../domain/value-objects/ids";

export class PasswordResetSessionRepositoryMock implements IPasswordResetSessionRepository {
	private readonly passwordResetSessionMap: Map<PasswordResetSessionId, PasswordResetSession>;

	constructor(maps: {
		passwordResetSessionMap: Map<PasswordResetSessionId, PasswordResetSession>;
	}) {
		this.passwordResetSessionMap = maps.passwordResetSessionMap;
	}

	async findById(id: PasswordResetSessionId): Promise<PasswordResetSession | null> {
		return this.passwordResetSessionMap.get(id) || null;
	}

	async save(passwordResetSession: PasswordResetSession): Promise<void> {
		this.passwordResetSessionMap.set(passwordResetSession.id, passwordResetSession);
	}

	async deleteById(id: PasswordResetSessionId): Promise<void> {
		this.passwordResetSessionMap.delete(id);
	}

	async deleteByUserId(userId: UserId): Promise<void> {
		for (const [sessionId, session] of this.passwordResetSessionMap.entries()) {
			if (session.userId === userId) {
				this.passwordResetSessionMap.delete(sessionId);
			}
		}
	}
}
