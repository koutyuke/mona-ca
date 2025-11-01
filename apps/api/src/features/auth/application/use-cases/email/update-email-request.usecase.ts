import { err, ok } from "@mona-ca/core/utils";
import { ulid } from "../../../../../core/lib/id";
import { createEmailVerificationSession } from "../../../domain/entities/email-verification-session";
import { newEmailVerificationSessionId } from "../../../domain/value-objects/ids";
import { formatAnySessionToken } from "../../../domain/value-objects/session-token";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { IEmailGateway } from "../../../../../core/ports/gateways";
import type { IRandomGenerator, ISessionSecretHasher } from "../../../../../core/ports/system";
import type { EmailVerificationSession } from "../../../domain/entities/email-verification-session";
import type { UserIdentity } from "../../../domain/entities/user-identity";
import type { EmailVerificationSessionToken } from "../../../domain/value-objects/session-token";
import type {
	IUpdateEmailRequestUseCase,
	UpdateEmailRequestUseCaseResult,
} from "../../contracts/email/update-email-request.usecase.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { IEmailVerificationSessionRepository } from "../../ports/repositories/email-verification-session.repository.interface";

export class UpdateEmailRequestUseCase implements IUpdateEmailRequestUseCase {
	constructor(
		private readonly emailVerificationSessionRepository: IEmailVerificationSessionRepository,
		private readonly authUserRepository: IAuthUserRepository,
		private readonly randomGenerator: IRandomGenerator,
		private readonly sessionSecretHasher: ISessionSecretHasher,
		private readonly emailGateway: IEmailGateway,
	) {}

	public async execute(email: string, userIdentity: UserIdentity): Promise<UpdateEmailRequestUseCaseResult> {
		const existingUserIdentityForNewEmail = await this.authUserRepository.findByEmail(email);
		if (existingUserIdentityForNewEmail) {
			return err("EMAIL_ALREADY_REGISTERED");
		}

		const { emailVerificationSessionToken, emailVerificationSession } = this.createEmailVerificationSession(
			email,
			userIdentity.id,
		);

		await this.emailVerificationSessionRepository.deleteByUserId(userIdentity.id);
		await this.emailVerificationSessionRepository.save(emailVerificationSession);

		await this.emailGateway.sendVerificationEmail(emailVerificationSession.email, emailVerificationSession.code);

		return ok({
			emailVerificationSessionToken,
			emailVerificationSession,
		});
	}

	private createEmailVerificationSession(
		email: string,
		userId: UserId,
	): {
		emailVerificationSessionToken: EmailVerificationSessionToken;
		emailVerificationSession: EmailVerificationSession;
	} {
		const code = this.randomGenerator.string(8, {
			digits: true,
		});
		const emailVerificationSessionSecret = this.sessionSecretHasher.generate();
		const secretHash = this.sessionSecretHasher.hash(emailVerificationSessionSecret);
		const emailVerificationSessionId = newEmailVerificationSessionId(ulid());
		const emailVerificationSessionToken = formatAnySessionToken(
			emailVerificationSessionId,
			emailVerificationSessionSecret,
		);
		const emailVerificationSession = createEmailVerificationSession({
			id: emailVerificationSessionId,
			email,
			userId,
			code,
			secretHash,
		});
		return { emailVerificationSessionToken, emailVerificationSession };
	}
}
