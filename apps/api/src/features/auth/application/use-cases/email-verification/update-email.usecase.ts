import { err, ok } from "@mona-ca/core/utils";
import { ulid } from "../../../../../shared/lib/id";
import { timingSafeStringEqual } from "../../../../../shared/lib/security";
import { createSession } from "../../../domain/entities/session";
import { updateUserIdentity } from "../../../domain/entities/user-identity";
import { newSessionId } from "../../../domain/value-objects/ids";
import { formatAnySessionToken } from "../../../domain/value-objects/session-token";

import type { UserId } from "../../../../../shared/domain/value-objects";
import type { ISessionSecretHasher } from "../../../../../shared/ports/system";
import type { EmailVerificationSession } from "../../../domain/entities/email-verification-session";
import type { Session } from "../../../domain/entities/session";
import type { UserIdentity } from "../../../domain/entities/user-identity";
import type { SessionToken } from "../../../domain/value-objects/session-token";
import type {
	IUpdateEmailUseCase,
	UpdateEmailUseCaseResult,
} from "../../contracts/email-verification/update-email.usecase.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { IEmailVerificationSessionRepository } from "../../ports/repositories/email-verification-session.repository.interface";
import type { ISessionRepository } from "../../ports/repositories/session.repository.interface";

export class UpdateEmailUseCase implements IUpdateEmailUseCase {
	constructor(
		private readonly authUserRepository: IAuthUserRepository,
		private readonly sessionRepository: ISessionRepository,
		private readonly emailVerificationSessionRepository: IEmailVerificationSessionRepository,
		private readonly sessionSecretHasher: ISessionSecretHasher,
	) {}

	/**
	 * this use case will be called after the validate email verification session use case.
	 *
	 * so we don't need to check the expired email verification session.
	 */
	public async execute(
		code: string,
		userIdentity: UserIdentity,
		emailVerificationSession: EmailVerificationSession,
	): Promise<UpdateEmailUseCaseResult> {
		const existingUserIdentityForNewEmail = await this.authUserRepository.findByEmail(emailVerificationSession.email);

		if (existingUserIdentityForNewEmail && existingUserIdentityForNewEmail.id !== userIdentity.id) {
			return err("EMAIL_ALREADY_REGISTERED");
		}

		if (!timingSafeStringEqual(emailVerificationSession.code, code)) {
			return err("INVALID_VERIFICATION_CODE");
		}

		await Promise.all([
			this.emailVerificationSessionRepository.deleteByUserId(userIdentity.id),
			this.sessionRepository.deleteByUserId(userIdentity.id),
		]);

		const { session, sessionToken } = this.createSession(userIdentity.id);

		const updatedUserIdentity = updateUserIdentity(userIdentity, {
			email: emailVerificationSession.email,
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
