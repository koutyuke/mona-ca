import { err, generateRandomString } from "../../../common/utils";
import { createEmailVerificationSession } from "../../../domain/entities";
import type { User } from "../../../domain/entities";
import { newEmailVerificationSessionId } from "../../../domain/value-object";
import type { IEmailVerificationSessionRepository } from "../../../interface-adapter/repositories/email-verification-session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { ISessionTokenService } from "../../services/session-token";
import type {
	EmailVerificationRequestUseCaseResult,
	IEmailVerificationRequestUseCase,
} from "./interfaces/email-verification-request.usecase.interface";

export class EmailVerificationRequestUseCase implements IEmailVerificationRequestUseCase {
	constructor(
		private readonly emailVerificationSessionRepository: IEmailVerificationSessionRepository,
		private readonly userRepository: IUserRepository,
		private readonly emailVerificationSessionTokenService: ISessionTokenService,
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

		const emailVerificationSessionToken = this.emailVerificationSessionTokenService.generateSessionToken();
		const emailVerificationSessionId = newEmailVerificationSessionId(
			this.emailVerificationSessionTokenService.hashSessionToken(emailVerificationSessionToken),
		);
		const emailVerificationSession = createEmailVerificationSession({
			id: emailVerificationSessionId,
			email,
			userId: user.id,
			code,
		});

		await this.emailVerificationSessionRepository.deleteByUserId(user.id);
		await this.emailVerificationSessionRepository.save(emailVerificationSession);

		return {
			emailVerificationSessionToken,
			emailVerificationSession,
		};
	}
}
