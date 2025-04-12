import { sessionExpiresSpan } from "../../../common/constants";
import { err } from "../../../common/utils";
import { Session, User } from "../../../domain/entities";
import { newEmailVerificationSessionId, newSessionId } from "../../../domain/value-object";
import type { IEmailVerificationSessionRepository } from "../../../interface-adapter/repositories/email-verification-session";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { ISessionTokenService } from "../../services/session-token";
import type {
	EmailVerificationConfirmUseCaseResult,
	IEmailVerificationConfirmUseCase,
} from "./interfaces/email-verification-confirm.usecase.interface";

export class EmailVerificationConfirmUseCase implements IEmailVerificationConfirmUseCase {
	constructor(
		private readonly emailVerificationSessionRepository: IEmailVerificationSessionRepository,
		private readonly userRepository: IUserRepository,
		private readonly sessionRepository: ISessionRepository,
		private readonly sessionTokenService: ISessionTokenService,
		private readonly emailVerificationSessionTokenService: ISessionTokenService,
	) {}

	public async execute(
		emailVerificationSessionToken: string,
		code: string,
		user: User,
	): Promise<EmailVerificationConfirmUseCaseResult> {
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

		if (emailVerificationSession.email !== user.email) {
			return err("INVALID_EMAIL");
		}

		if (emailVerificationSession.code !== code) {
			return err("INVALID_CODE");
		}

		await this.emailVerificationSessionRepository.deleteByUserId(user.id);

		if (emailVerificationSession.isExpired) {
			return err("CODE_WAS_EXPIRED");
		}

		// Delete all sessions for the user.
		await this.sessionRepository.deleteByUserId(user.id);

		const sessionToken = this.sessionTokenService.generateSessionToken();
		const sessionId = newSessionId(this.sessionTokenService.hashSessionToken(sessionToken));
		const session = new Session({
			id: sessionId,
			userId: user.id,
			expiresAt: new Date(Date.now() + sessionExpiresSpan.milliseconds()),
		});

		const updatedUser = new User({
			...user,
			emailVerified: true,
			updatedAt: new Date(),
		});

		await Promise.all([this.userRepository.save(updatedUser), this.sessionRepository.save(session)]);

		return {
			session,
			sessionToken,
		};
	}
}
