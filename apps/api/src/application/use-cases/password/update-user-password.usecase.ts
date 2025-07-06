import { err, ulid } from "../../../common/utils";
import { createSession } from "../../../domain/entities";
import type { User } from "../../../domain/entities";
import { newSessionId } from "../../../domain/value-object";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { IPasswordService } from "../../services/password";
import { type ISessionSecretService, createSessionToken } from "../../services/session";
import type {
	IUpdateUserPasswordUseCase,
	UpdateUserPasswordUseCaseResult,
} from "./interfaces/update-user-password.usecase.interface";

export class UpdateUserPasswordUseCase implements IUpdateUserPasswordUseCase {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly sessionRepository: ISessionRepository,
		private readonly passwordService: IPasswordService,
		private readonly sessionTokenService: ISessionSecretService,
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

			const verifyPassword = await this.passwordService.verifyPassword(currentPassword, passwordHash);
			if (!verifyPassword) {
				return err("INVALID_CURRENT_PASSWORD");
			}
		}

		const [newPasswordHash] = await Promise.all([
			this.passwordService.hashPassword(newPassword),

			// Delete all sessions of the user.
			this.sessionRepository.deleteByUserId(user.id),
		]);

		// Generate a new session.
		const sessionSecret = this.sessionTokenService.generateSessionSecret();
		const sessionSecretHash = this.sessionTokenService.hashSessionSecret(sessionSecret);
		const sessionId = newSessionId(ulid());
		const sessionToken = createSessionToken(sessionId, sessionSecret);
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
