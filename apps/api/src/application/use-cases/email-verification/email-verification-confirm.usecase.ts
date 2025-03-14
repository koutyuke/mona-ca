import { err } from "../../../common/utils";
import { User } from "../../../domain/entities";
import { newEmailVerificationSessionId } from "../../../domain/value-object";
import type { IEmailVerificationSessionRepository } from "../../../interface-adapter/repositories/email-verification-session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { ISessionTokenService } from "../../services/session-token";
import type {
	EmailVerificationConfirmUseCaseResult,
	IEmailVerificationConfirmUseCase,
} from "./interfaces/email-verification-confirm.usecase.interface";

export class EmailVerificationConfirmUseCase implements IEmailVerificationConfirmUseCase {
	constructor(
		private emailVerificationSessionRepository: IEmailVerificationSessionRepository,
		private userRepository: IUserRepository,
		private sessionTokenService: ISessionTokenService,
	) {}

	public async execute(
		emailVerificationSessionToken: string,
		code: string,
		user: User,
	): Promise<EmailVerificationConfirmUseCaseResult> {
		const emailVerificationSessionId = newEmailVerificationSessionId(
			this.sessionTokenService.hashSessionToken(emailVerificationSessionToken),
		);
		const emailVerificationSession = await this.emailVerificationSessionRepository.findByIdAndUserId(
			emailVerificationSessionId,
			user.id,
		);

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
			updatedAt: new Date(),
		});

		await this.userRepository.save(updatedUser);

		return;
	}
}
