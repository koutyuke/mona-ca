import { err, timingSafeStringEqual, ulid } from "../../../common/utils";
import { createSession, updateUser } from "../../../domain/entities";
import type { EmailVerificationSession, User } from "../../../domain/entities";
import { newSessionId } from "../../../domain/value-object";
import type { IEmailVerificationSessionRepository } from "../../../interface-adapter/repositories/email-verification-session";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import { type ISessionSecretService, createSessionToken } from "../../services/session";
import type {
	EmailVerificationConfirmUseCaseResult,
	IEmailVerificationConfirmUseCase,
} from "./interfaces/email-verification-confirm.usecase.interface";

// this use case will be called after the validate email verification session use case.
// so we don't need to check the expired email verification session.
export class EmailVerificationConfirmUseCase implements IEmailVerificationConfirmUseCase {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly sessionRepository: ISessionRepository,
		private readonly emailVerificationSessionRepository: IEmailVerificationSessionRepository,
		private readonly sessionSecretService: ISessionSecretService,
	) {}

	public async execute(
		code: string,
		user: User,
		emailVerificationSession: EmailVerificationSession,
	): Promise<EmailVerificationConfirmUseCaseResult> {
		if (emailVerificationSession.email !== user.email) {
			return err("EMAIL_MISMATCH");
		}

		if (!timingSafeStringEqual(emailVerificationSession.code, code)) {
			return err("INVALID_VERIFICATION_CODE");
		}

		await this.emailVerificationSessionRepository.deleteByUserId(user.id);

		// Delete all sessions for the user.
		await this.sessionRepository.deleteByUserId(user.id);

		const sessionSecret = this.sessionSecretService.generateSessionSecret();
		const sessionSecretHash = this.sessionSecretService.hashSessionSecret(sessionSecret);
		const sessionId = newSessionId(ulid());
		const sessionToken = createSessionToken(sessionId, sessionSecret);
		const session = createSession({
			id: sessionId,
			userId: user.id,
			secretHash: sessionSecretHash,
		});

		const updatedUser = updateUser(user, {
			emailVerified: true,
		});

		await Promise.all([this.userRepository.save(updatedUser), this.sessionRepository.save(session)]);

		return {
			session,
			sessionToken,
		};
	}
}
