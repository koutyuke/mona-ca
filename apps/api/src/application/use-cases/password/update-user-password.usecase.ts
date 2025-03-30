import { sessionExpiresSpan } from "../../../common/constants";
import { err } from "../../../common/utils";
import { Session, type User } from "../../../domain/entities";
import { newSessionId } from "../../../domain/value-object";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { IPasswordService } from "../../services/password";
import type { ISessionTokenService } from "../../services/session-token";
import type {
	IUpdateUserPasswordUseCase,
	UpdateUserPasswordUseCaseResult,
} from "./interfaces/update-user-password.usecase.interface";

export class UpdateUserPasswordUseCase implements IUpdateUserPasswordUseCase {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly sessionRepository: ISessionRepository,
		private readonly passwordService: IPasswordService,
		private readonly sessionTokenService: ISessionTokenService,
	) {}

	public async execute(
		currentUser: User,
		currentPassword: string | undefined,
		newPassword: string,
	): Promise<UpdateUserPasswordUseCaseResult> {
		const passwordHash = await this.userRepository.findPasswordHashById(currentUser.id);

		if (passwordHash === null) {
			if (currentPassword) {
				return err("INVALID_CURRENT_PASSWORD");
			}
		} else {
			if (!currentPassword) {
				return err("CURRENT_PASSWORD_REQUIRED");
			}

			const verifyPassword = await this.passwordService.verifyPassword(currentPassword, passwordHash);
			if (!verifyPassword) {
				return err("INVALID_CURRENT_PASSWORD");
			}
		}

		const [newPasswordHash] = await Promise.all([
			this.passwordService.hashPassword(newPassword),

			// Delete all sessions of the user.
			this.sessionRepository.deleteByUserId(currentUser.id),
		]);

		// Generate a new session.
		const sessionToken = this.sessionTokenService.generateSessionToken();
		const sessionId = newSessionId(this.sessionTokenService.hashSessionToken(sessionToken));
		const session = new Session({
			id: sessionId,
			userId: currentUser.id,
			expiresAt: new Date(Date.now() + sessionExpiresSpan.milliseconds()),
		});

		await Promise.all([
			this.userRepository.save(currentUser, { passwordHash: newPasswordHash }),
			this.sessionRepository.save(session),
		]);

		return {
			session,
			sessionToken,
		};
	}
}
