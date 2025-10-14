import { err, ok } from "@mona-ca/core/utils";
import { timingSafeStringEqual, ulid } from "../../../common/utils";
import { createSession, updateUser } from "../../../domain/entities";
import type { EmailVerificationSession, Session, User } from "../../../domain/entities";
import { type SessionToken, type UserId, formatSessionToken, newSessionId } from "../../../domain/value-object";
import type { IUpdateEmailUseCase, UpdateEmailUseCaseResult } from "../../ports/in";
import type {
	IEmailVerificationSessionRepository,
	ISessionRepository,
	IUserRepository,
} from "../../ports/out/repositories";
import type { ISessionSecretHasher } from "../../ports/out/system";

// this use case will be called after the validate email verification session use case.
// so we don't need to check the expired email verification session.
export class UpdateEmailUseCase implements IUpdateEmailUseCase {
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
	): Promise<UpdateEmailUseCaseResult> {
		const existingUserForNewEmail = await this.userRepository.findByEmail(emailVerificationSession.email);

		if (existingUserForNewEmail && existingUserForNewEmail.id !== user.id) {
			return err("EMAIL_ALREADY_REGISTERED");
		}

		if (!timingSafeStringEqual(emailVerificationSession.code, code)) {
			return err("INVALID_VERIFICATION_CODE");
		}

		await this.emailVerificationSessionRepository.deleteByUserId(user.id);
		await this.sessionRepository.deleteByUserId(user.id);

		const { session, sessionToken } = this.createSession(user.id);

		const updatedUser = updateUser(user, {
			emailVerified: true,
			email: emailVerificationSession.email,
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
