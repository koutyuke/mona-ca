import { err, ok } from "@mona-ca/core/utils";
import { ulid } from "../../../../../core/lib/id";
import { timingSafeStringEqual } from "../../../../../core/lib/security";
import { createSession } from "../../../domain/entities/session";
import { updateUserCredentials } from "../../../domain/entities/user-credentials";
import { newSessionId } from "../../../domain/value-objects/ids";
import { encodeToken } from "../../../domain/value-objects/tokens";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { ITokenSecretService } from "../../../../../core/ports/system";
import type { EmailVerificationSession } from "../../../domain/entities/email-verification-session";
import type { Session } from "../../../domain/entities/session";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { SessionToken } from "../../../domain/value-objects/tokens";
import type {
	IUpdateEmailVerifyCodeUseCase,
	UpdateEmailVerifyCodeUseCaseResult,
} from "../../contracts/update-email/verify-code.usecase.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { IEmailVerificationSessionRepository } from "../../ports/repositories/email-verification-session.repository.interface";
import type { ISessionRepository } from "../../ports/repositories/session.repository.interface";

export class UpdateEmailVerifyCodeUseCase implements IUpdateEmailVerifyCodeUseCase {
	constructor(
		// repositories
		private readonly authUserRepository: IAuthUserRepository,
		private readonly sessionRepository: ISessionRepository,
		private readonly emailVerificationSessionRepository: IEmailVerificationSessionRepository,
		// system
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	/**
	 * this use case will be called after the validate email verification session use case.
	 *
	 * so we don't need to check the expired email verification session.
	 */
	public async execute(
		code: string,
		userCredentials: UserCredentials,
		emailVerificationSession: EmailVerificationSession,
	): Promise<UpdateEmailVerifyCodeUseCaseResult> {
		if (!timingSafeStringEqual(emailVerificationSession.code, code)) {
			return err("INVALID_VERIFICATION_CODE");
		}

		const existingUserIdentityForNewEmail = await this.authUserRepository.findByEmail(emailVerificationSession.email);

		if (existingUserIdentityForNewEmail) {
			await this.emailVerificationSessionRepository.deleteByUserId(userCredentials.id);
			return err("EMAIL_ALREADY_REGISTERED");
		}

		await Promise.all([
			this.emailVerificationSessionRepository.deleteByUserId(userCredentials.id),
			this.sessionRepository.deleteByUserId(userCredentials.id),
		]);

		const { session, sessionToken } = this.createSession(userCredentials.id);

		const updatedUserCredentials = updateUserCredentials(userCredentials, {
			email: emailVerificationSession.email,
		});

		await Promise.all([this.authUserRepository.update(updatedUserCredentials), this.sessionRepository.save(session)]);

		return ok({
			session,
			sessionToken,
		});
	}

	private createSession(userId: UserId): {
		session: Session;
		sessionToken: SessionToken;
	} {
		const id = newSessionId(ulid());
		const secret = this.tokenSecretService.generateSecret();
		const secretHash = this.tokenSecretService.hash(secret);
		const sessionToken = encodeToken(id, secret);
		const session = createSession({
			id: id,
			userId,
			secretHash,
		});
		return { session, sessionToken };
	}
}
