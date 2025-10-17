import { err, ok } from "@mona-ca/core/utils";
import type {
	EmailVerificationConfirmUseCaseResult,
	IEmailVerificationConfirmUseCase,
} from "../../../../../application/ports/in";
import {
	type SessionToken,
	type UserId,
	formatSessionToken,
	newSessionId,
} from "../../../../../common/domain/value-objects";
import type { ISessionSecretHasher } from "../../../../../common/ports/system";
import { timingSafeStringEqual, ulid } from "../../../../../lib/utils";
import { createSession, updateUser } from "../../../domain/entities";
import type { EmailVerificationSession, Session, User } from "../../../domain/entities";
import type {
	IEmailVerificationSessionRepository,
	ISessionRepository,
	IUserRepository,
} from "../../ports/out/repositories";

// this use case will be called after the validate email verification session use case.
// so we don't need to check the expired email verification session.
export class EmailVerificationConfirmUseCase implements IEmailVerificationConfirmUseCase {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly sessionRepository: ISessionRepository,
		private readonly emailVerificationSessionRepository: IEmailVerificationSessionRepository,
		private readonly sessionSecretHasher: ISessionSecretHasher,
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

		const { session, sessionToken } = this.createSession(user.id);

		const updatedUser = updateUser(user, {
			emailVerified: true,
		});

		await Promise.all([this.userRepository.save(updatedUser), this.sessionRepository.save(session)]);

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
