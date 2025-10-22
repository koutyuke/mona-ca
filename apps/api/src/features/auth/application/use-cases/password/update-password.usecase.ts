import { err, ok } from "@mona-ca/core/utils";
import { ulid } from "../../../../../core/lib/id";
import { createSession } from "../../../domain/entities/session";
import { updateUserIdentity } from "../../../domain/entities/user-identity";
import { newSessionId } from "../../../domain/value-objects/ids";
import { formatAnySessionToken } from "../../../domain/value-objects/session-token";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { IPasswordHasher, ISessionSecretHasher } from "../../../../../core/ports/system";
import type { Session } from "../../../domain/entities/session";
import type { UserIdentity } from "../../../domain/entities/user-identity";
import type { SessionToken } from "../../../domain/value-objects/session-token";
import type {
	IUpdatePasswordUseCase,
	UpdatePasswordUseCaseResult,
} from "../../contracts/password/update-password.usecase.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { ISessionRepository } from "../../ports/repositories/session.repository.interface";

export class UpdatePasswordUseCase implements IUpdatePasswordUseCase {
	constructor(
		private readonly authUserRepository: IAuthUserRepository,
		private readonly sessionRepository: ISessionRepository,
		private readonly passwordHasher: IPasswordHasher,
		private readonly sessionSecretHasher: ISessionSecretHasher,
	) {}

	public async execute(
		userIdentity: UserIdentity,
		currentPassword: string | null,
		newPassword: string,
	): Promise<UpdatePasswordUseCaseResult> {
		if (userIdentity.passwordHash === null) {
			if (currentPassword) {
				return err("INVALID_CURRENT_PASSWORD");
			}
		} else {
			if (!currentPassword) {
				return err("INVALID_CURRENT_PASSWORD");
			}

			const verifyPasswordResult = await this.passwordHasher.verify(currentPassword, userIdentity.passwordHash);
			if (!verifyPasswordResult) {
				return err("INVALID_CURRENT_PASSWORD");
			}
		}

		const [newPasswordHash] = await Promise.all([
			this.passwordHasher.hash(newPassword),

			// Delete all sessions of the user.
			this.sessionRepository.deleteByUserId(userIdentity.id),
		]);

		// Generate a new session.
		const { session, sessionToken } = this.createSession(userIdentity.id);

		const updatedUserIdentity = updateUserIdentity(userIdentity, {
			passwordHash: newPasswordHash,
		});

		await Promise.all([this.authUserRepository.update(updatedUserIdentity), this.sessionRepository.save(session)]);

		return ok({
			session,
			sessionToken,
		});
	}

	private createSession(userId: UserId): {
		session: Session;
		sessionToken: SessionToken;
	} {
		const sessionSecret = this.sessionSecretHasher.generate();
		const sessionSecretHash = this.sessionSecretHasher.hash(sessionSecret);
		const sessionId = newSessionId(ulid());
		const sessionToken = formatAnySessionToken(sessionId, sessionSecret);
		const session = createSession({
			id: sessionId,
			userId,
			secretHash: sessionSecretHash,
		});
		return { session, sessionToken };
	}
}
