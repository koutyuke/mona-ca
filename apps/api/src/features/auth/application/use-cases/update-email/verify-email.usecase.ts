import { err, ok } from "@mona-ca/core/result";
import { ulid } from "../../../../../core/lib/id";
import { timingSafeStringEqual } from "../../../../../core/lib/security";
import { createSession } from "../../../domain/entities/session";
import { updateUserCredentials } from "../../../domain/entities/user-credentials";
import { newSessionId } from "../../../domain/value-objects/ids";
import { encodeToken } from "../../../domain/value-objects/tokens";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { ITokenSecretService } from "../../../../../core/ports/system";
import type { EmailVerificationRequest } from "../../../domain/entities/email-verification-request";
import type { Session } from "../../../domain/entities/session";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { SessionToken } from "../../../domain/value-objects/tokens";
import type {
	IUpdateEmailVerifyEmailUseCase,
	UpdateEmailVerifyEmailUseCaseResult,
} from "../../contracts/update-email/verify-email.usecase.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { IEmailVerificationRequestRepository } from "../../ports/repositories/email-verification-request.repository.interface";
import type { ISessionRepository } from "../../ports/repositories/session.repository.interface";

export class UpdateEmailVerifyEmailUseCase implements IUpdateEmailVerifyEmailUseCase {
	constructor(
		// repositories
		private readonly authUserRepository: IAuthUserRepository,
		private readonly sessionRepository: ISessionRepository,
		private readonly emailVerificationRequestRepository: IEmailVerificationRequestRepository,
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
		emailVerificationRequest: EmailVerificationRequest,
	): Promise<UpdateEmailVerifyEmailUseCaseResult> {
		if (!timingSafeStringEqual(emailVerificationRequest.code, code)) {
			return err("INVALID_VERIFICATION_CODE");
		}

		const existingUserIdentityForNewEmail = await this.authUserRepository.findByEmail(emailVerificationRequest.email);

		if (existingUserIdentityForNewEmail) {
			await this.emailVerificationRequestRepository.deleteByUserId(userCredentials.id);
			return err("EMAIL_ALREADY_REGISTERED");
		}

		await Promise.all([
			this.emailVerificationRequestRepository.deleteByUserId(userCredentials.id),
			this.sessionRepository.deleteByUserId(userCredentials.id),
		]);

		const { session, sessionToken } = this.createSession(userCredentials.id);

		const updatedUserCredentials = updateUserCredentials(userCredentials, {
			email: emailVerificationRequest.email,
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
