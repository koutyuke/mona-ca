import { err } from "../../../common/utils";
import { createSession, isExpiredEmailVerificationSession, updateUser } from "../../../domain/entities";
import type { User } from "../../../domain/entities";
import { newEmailVerificationSessionId, newSessionId } from "../../../domain/value-object";
import type { IEmailVerificationSessionRepository } from "../../../interface-adapter/repositories/email-verification-session";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { ISessionTokenService } from "../../services/session-token";
import type { ChangeEmailUseCaseResult, IChangeEmailUseCase } from "./interfaces/change-email.usecase.interface";

export class ChangeEmailUseCase implements IChangeEmailUseCase {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly sessionRepository: ISessionRepository,
		private readonly emailVerificationSessionRepository: IEmailVerificationSessionRepository,
		private readonly sessionTokenService: ISessionTokenService,
		private readonly emailVerificationSessionTokenService: ISessionTokenService,
	) {}

	public async execute(
		emailVerificationSessionToken: string,
		code: string,
		user: User,
	): Promise<ChangeEmailUseCaseResult> {
		const emailVerificationSessionId = newEmailVerificationSessionId(
			this.emailVerificationSessionTokenService.hashSessionToken(emailVerificationSessionToken),
		);
		const emailVerificationSession = await this.emailVerificationSessionRepository.findByIdAndUserId(
			emailVerificationSessionId,
			user.id,
		);

		if (!emailVerificationSession) {
			return err("NOT_REQUEST");
		}

		const existingUserForNewEmail = await this.userRepository.findByEmail(emailVerificationSession.email);

		if (existingUserForNewEmail) {
			return err("EMAIL_IS_ALREADY_USED");
		}

		if (emailVerificationSession.code !== code) {
			return err("INVALID_CODE");
		}

		await this.emailVerificationSessionRepository.deleteByUserId(user.id);

		if (isExpiredEmailVerificationSession(emailVerificationSession)) {
			return err("EXPIRED_CODE");
		}

		// Generate a new session.
		const sessionToken = this.sessionTokenService.generateSessionToken();
		const sessionId = newSessionId(this.sessionTokenService.hashSessionToken(sessionToken));
		const session = createSession({
			id: sessionId,
			userId: user.id,
		});

		const updatedUser = updateUser(user, {
			emailVerified: true,
			email: emailVerificationSession.email,
		});

		await Promise.all([this.userRepository.save(updatedUser), this.sessionRepository.save(session)]);

		return {
			session,
			sessionToken,
		};
	}
}
