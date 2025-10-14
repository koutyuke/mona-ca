import { err, ok } from "@mona-ca/core/utils";
import { ulid } from "../../../common/utils";
import { createSession } from "../../../domain/entities";
import type { Session, User } from "../../../domain/entities";
import { type SessionToken, type UserId, formatSessionToken, newSessionId } from "../../../domain/value-object";
import type { IUpdateUserPasswordUseCase, UpdateUserPasswordUseCaseResult } from "../../ports/in";
import type { ISessionRepository, IUserRepository } from "../../ports/out/repositories";
import type { IPasswordHasher, ISessionSecretHasher } from "../../ports/out/system";

export class UpdateUserPasswordUseCase implements IUpdateUserPasswordUseCase {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly sessionRepository: ISessionRepository,
		private readonly passwordHasher: IPasswordHasher,
		private readonly sessionSecretHasher: ISessionSecretHasher,
	) {}

	public async execute(
		user: User,
		currentPassword: string | undefined,
		newPassword: string,
	): Promise<UpdateUserPasswordUseCaseResult> {
		const passwordHash = await this.userRepository.findPasswordHashById(user.id);

		if (passwordHash === null) {
			if (currentPassword) {
				return err("INVALID_CURRENT_PASSWORD");
			}
		} else {
			if (!currentPassword) {
				return err("INVALID_CURRENT_PASSWORD");
			}

			const verifyPasswordResult = await this.passwordHasher.verify(currentPassword, passwordHash);
			if (!verifyPasswordResult) {
				return err("INVALID_CURRENT_PASSWORD");
			}
		}

		const [newPasswordHash] = await Promise.all([
			this.passwordHasher.hash(newPassword),

			// Delete all sessions of the user.
			this.sessionRepository.deleteByUserId(user.id),
		]);

		// Generate a new session.
		const { session, sessionToken } = this.createSession(user.id);

		await Promise.all([
			this.userRepository.save(user, { passwordHash: newPasswordHash }),
			this.sessionRepository.save(session),
		]);

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
		const sessionToken = formatSessionToken(sessionId, sessionSecret);
		const session = createSession({
			id: sessionId,
			userId,
			secretHash: sessionSecretHash,
		});
		return { session, sessionToken };
	}
}
