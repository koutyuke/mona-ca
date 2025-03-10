import { emailVerificationSessionExpiresSpan } from "../../../common/constants";
import { generateRandomString } from "../../../common/utils";
import { err } from "../../../common/utils";
import { EmailVerificationSession, type User } from "../../../domain/entities";
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
		private emailVerificationSessionRepository: IEmailVerificationSessionRepository,
		private userRepository: IUserRepository,
		private sessionTokenService: ISessionTokenService,
	) {}

	public async execute(email: string, user: User): Promise<EmailVerificationRequestUseCaseResult> {
		if (email === user.email && user.emailVerified) {
			return err("EMAIL_IS_ALREADY_VERIFIED");
		}

		const sameEmailUser = await this.userRepository.findByEmail(email);

		if (sameEmailUser && sameEmailUser.id !== user.id) {
			return err("EMAIL_IS_ALREADY_USED");
		}

		const code = generateRandomString(8, {
			number: true,
		});

		const emailVerificationSessionToken = this.sessionTokenService.generateSessionToken();
		const emailVerificationSessionId = newEmailVerificationSessionId(
			this.sessionTokenService.hashSessionToken(emailVerificationSessionToken),
		);
		const emailVerificationSession = new EmailVerificationSession({
			id: emailVerificationSessionId,
			email,
			userId: user.id,
			code,
			expiresAt: new Date(Date.now() + emailVerificationSessionExpiresSpan.milliseconds()),
		});

		await this.emailVerificationSessionRepository.deleteByUserId(user.id);
		await this.emailVerificationSessionRepository.save(emailVerificationSession);

		return {
			emailVerificationSessionToken,
			emailVerificationSession,
		};
	}
}
