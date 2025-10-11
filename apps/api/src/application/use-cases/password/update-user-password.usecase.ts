import { err, ulid } from "../../../common/utils";
import { createSession } from "../../../domain/entities";
import type { User } from "../../../domain/entities";
import { formatSessionToken, newSessionId } from "../../../domain/value-object";
import { generateSessionSecret, hashPassword, hashSessionSecret, verifyPassword } from "../../../infrastructure/crypt";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { IUpdateUserPasswordUseCase, UpdateUserPasswordUseCaseResult } from "../../ports/in";

export class UpdateUserPasswordUseCase implements IUpdateUserPasswordUseCase {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly sessionRepository: ISessionRepository,
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

			const verifyPasswordResult = await verifyPassword(currentPassword, passwordHash);
			if (!verifyPasswordResult) {
				return err("INVALID_CURRENT_PASSWORD");
			}
		}

		const [newPasswordHash] = await Promise.all([
			hashPassword(newPassword),

			// Delete all sessions of the user.
			this.sessionRepository.deleteByUserId(user.id),
		]);

		// Generate a new session.
		const sessionSecret = generateSessionSecret();
		const sessionSecretHash = hashSessionSecret(sessionSecret);
		const sessionId = newSessionId(ulid());
		const sessionToken = formatSessionToken(sessionId, sessionSecret);
		const session = createSession({
			id: sessionId,
			userId: user.id,
			secretHash: sessionSecretHash,
		});

		await Promise.all([
			this.userRepository.save(user, { passwordHash: newPasswordHash }),
			this.sessionRepository.save(session),
		]);

		return {
			session,
			sessionToken,
		};
	}
}
