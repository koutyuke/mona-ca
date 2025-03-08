import { emailVerificationExpiresSpan } from "../../../common/constants";
import { generateRandomString, ulid } from "../../../common/utils";
import { err } from "../../../common/utils";
import { EmailVerification, type User } from "../../../domain/entities";
import { newEmailVerificationId } from "../../../domain/value-object";
import type { IEmailVerificationRepository } from "../../../interface-adapter/repositories/email-verification";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type {
	EmailVerificationRequestUseCaseResult,
	IEmailVerificationRequestUseCase,
} from "./interfaces/email-verification-request.usecase.interface";

export class EmailVerificationRequestUseCase implements IEmailVerificationRequestUseCase {
	constructor(
		private emailVerificationRepository: IEmailVerificationRepository,
		private userRepository: IUserRepository,
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

		const newEmailVerification = new EmailVerification({
			id: newEmailVerificationId(ulid()),
			email,
			userId: user.id,
			code,
			expiresAt: new Date(Date.now() + emailVerificationExpiresSpan.milliseconds()),
		});

		await this.emailVerificationRepository.deleteByUserId(user.id);
		await this.emailVerificationRepository.save(newEmailVerification);

		return newEmailVerification;
	}
}
