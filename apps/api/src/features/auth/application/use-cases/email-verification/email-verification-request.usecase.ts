import { err, ok } from "@mona-ca/core/utils";
import type {
	EmailVerificationRequestUseCaseResult,
	IEmailVerificationRequestUseCase,
} from "../../../../../application/ports/in";
import {
	type EmailVerificationSessionToken,
	formatSessionToken,
	newEmailVerificationSessionId,
} from "../../../../../common/domain/value-objects";
import type { IRandomGenerator, ISessionSecretHasher } from "../../../../../common/ports/system";
import { ulid } from "../../../../../lib/utils";
import { createEmailVerificationSession } from "../../../domain/entities";
import type { EmailVerificationSession, User } from "../../../domain/entities";
import type { IEmailVerificationSessionRepository, IUserRepository } from "../../ports/out/repositories";

export class EmailVerificationRequestUseCase implements IEmailVerificationRequestUseCase {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly emailVerificationSessionRepository: IEmailVerificationSessionRepository,
		private readonly randomGenerator: IRandomGenerator,
		private readonly sessionSecretHasher: ISessionSecretHasher,
	) {}

	public async execute(email: string, user: User): Promise<EmailVerificationRequestUseCaseResult> {
		if (email === user.email && user.emailVerified) {
			return err("EMAIL_ALREADY_VERIFIED");
		}

		const existingUserForVerifiedEmail = await this.userRepository.findByEmail(email);

		if (existingUserForVerifiedEmail && existingUserForVerifiedEmail.id !== user.id) {
			return err("EMAIL_ALREADY_REGISTERED");
		}

		const { emailVerificationSessionToken, emailVerificationSession } = this.createEmailVerificationSession(
			email,
			user,
		);

		await this.emailVerificationSessionRepository.deleteByUserId(user.id);
		await this.emailVerificationSessionRepository.save(emailVerificationSession);

		return ok({
			emailVerificationSessionToken,
			emailVerificationSession,
		});
	}

	private createEmailVerificationSession(
		email: string,
		user: User,
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
		const emailVerificationSessionToken = formatSessionToken(
			emailVerificationSessionId,
			emailVerificationSessionSecret,
		);
		const emailVerificationSession = createEmailVerificationSession({
			id: emailVerificationSessionId,
			email,
			userId: user.id,
			code,
			secretHash,
		});
		return { emailVerificationSessionToken, emailVerificationSession };
	}
}
