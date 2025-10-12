import { err, ulid } from "../../../common/utils";
import { createEmailVerificationSession } from "../../../domain/entities";
import type { User } from "../../../domain/entities";
import { formatSessionToken, newEmailVerificationSessionId } from "../../../domain/value-object";
import { generateRandomString, generateSessionSecret, hashSessionSecret } from "../../../infrastructure/crypt";
import type { EmailVerificationRequestUseCaseResult, IEmailVerificationRequestUseCase } from "../../ports/in";
import type { IEmailVerificationSessionRepository, IUserRepository } from "../../ports/out/repositories";

export class EmailVerificationRequestUseCase implements IEmailVerificationRequestUseCase {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly emailVerificationSessionRepository: IEmailVerificationSessionRepository,
	) {}

	public async execute(email: string, user: User): Promise<EmailVerificationRequestUseCaseResult> {
		if (email === user.email && user.emailVerified) {
			return err("EMAIL_ALREADY_VERIFIED");
		}

		const existingUserForVerifiedEmail = await this.userRepository.findByEmail(email);

		if (existingUserForVerifiedEmail && existingUserForVerifiedEmail.id !== user.id) {
			return err("EMAIL_ALREADY_REGISTERED");
		}

		const code = generateRandomString(8, {
			number: true,
		});

		const emailVerificationSessionSecret = generateSessionSecret();
		const secretHash = hashSessionSecret(emailVerificationSessionSecret);
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

		await this.emailVerificationSessionRepository.deleteByUserId(user.id);
		await this.emailVerificationSessionRepository.save(emailVerificationSession);

		return {
			emailVerificationSessionToken,
			emailVerificationSession,
		};
	}
}
