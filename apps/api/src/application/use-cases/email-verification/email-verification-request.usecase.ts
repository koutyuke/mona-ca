import { err, generateRandomString, ulid } from "../../../common/utils";
import { createEmailVerificationSession } from "../../../domain/entities";
import type { User } from "../../../domain/entities";
import { newEmailVerificationSessionId } from "../../../domain/value-object";
import type { IEmailVerificationSessionRepository } from "../../../interface-adapter/repositories/email-verification-session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import { type ISessionSecretService, createSessionToken } from "../../services/session";
import type {
	EmailVerificationRequestUseCaseResult,
	IEmailVerificationRequestUseCase,
} from "./interfaces/email-verification-request.usecase.interface";

export class EmailVerificationRequestUseCase implements IEmailVerificationRequestUseCase {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly emailVerificationSessionRepository: IEmailVerificationSessionRepository,
		private readonly emailVerificationSessionSecretService: ISessionSecretService,
	) {}

	public async execute(email: string, user: User): Promise<EmailVerificationRequestUseCaseResult> {
		if (email === user.email && user.emailVerified) {
			return err("EMAIL_IS_ALREADY_VERIFIED");
		}

		const existingUserForVerifiedEmail = await this.userRepository.findByEmail(email);

		if (existingUserForVerifiedEmail && existingUserForVerifiedEmail.id !== user.id) {
			return err("EMAIL_IS_ALREADY_USED");
		}

		const code = generateRandomString(8, {
			number: true,
		});

		const emailVerificationSessionSecret = this.emailVerificationSessionSecretService.generateSessionSecret();
		const secretHash = this.emailVerificationSessionSecretService.hashSessionSecret(emailVerificationSessionSecret);
		const emailVerificationSessionId = newEmailVerificationSessionId(ulid());
		const emailVerificationSessionToken = createSessionToken(
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
