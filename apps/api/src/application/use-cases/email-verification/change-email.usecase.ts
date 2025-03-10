import { err } from "../../../common/utils";
import { User } from "../../../domain/entities";
import { newEmailVerificationSessionId } from "../../../domain/value-object";
import type { IEmailVerificationSessionRepository } from "../../../interface-adapter/repositories/email-verification-session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { ISessionTokenService } from "../../services/session-token";
import type { ChangeEmailUseCaseResult, IChangeEmailUseCase } from "./interfaces/change-email.usecase.interface";

export class ChangeEmailUseCase implements IChangeEmailUseCase {
	constructor(
		private userRepository: IUserRepository,
		private emailVerificationSessionRepository: IEmailVerificationSessionRepository,
		private sessionTokenService: ISessionTokenService,
	) {}

	public async execute(
		emailVerificationSessionToken: string,
		email: string,
		code: string,
		user: User,
	): Promise<ChangeEmailUseCaseResult> {
		const emailVerificationSessionId = newEmailVerificationSessionId(
			this.sessionTokenService.hashSessionToken(emailVerificationSessionToken),
		);
		const [sameEmailUser, emailVerificationSession] = await Promise.all([
			this.userRepository.findByEmail(email),
			this.emailVerificationSessionRepository.findByIdAndUserId(emailVerificationSessionId, user.id),
		]);

		if (sameEmailUser) {
			return err("EMAIL_IS_ALREADY_USED");
		}

		if (!emailVerificationSession) {
			return err("NOT_REQUEST");
		}

		if (emailVerificationSession.code !== code) {
			return err("INVALID_CODE");
		}

		if (emailVerificationSession.email !== user.email) {
			return err("INVALID_EMAIL");
		}

		await this.emailVerificationSessionRepository.deleteByUserId(user.id);

		if (emailVerificationSession.isExpired) {
			return err("CODE_WAS_EXPIRED");
		}

		const updatedUser = new User({
			...user,
			emailVerified: true,
			email,
			updatedAt: new Date(),
		});

		await this.userRepository.save(updatedUser);

		return;
	}
}
