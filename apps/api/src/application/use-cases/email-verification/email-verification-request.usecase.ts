import { emailVerificationCodeExpiresSpan } from "../../../common/constants";
import { generateRandomString, ulid } from "../../../common/utils";
import { err } from "../../../common/utils";
import type { User } from "../../../domain/entities/user";
import type { IEmailVerificationCodeRepository } from "../../../interface-adapter/repositories/email-verification-code";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type {
	EmailVerificationRequestUseCaseResult,
	IEmailVerificationRequestUseCase,
} from "./interfaces/email-verification-request.usecase.interface";

export class EmailVerificationRequestUseCase implements IEmailVerificationRequestUseCase {
	constructor(
		private emailVerificationCodeRepository: IEmailVerificationCodeRepository,
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

		await this.emailVerificationCodeRepository.delete({ userId: user.id });
		const verificationCode = await this.emailVerificationCodeRepository.create({
			id: ulid(),
			email,
			userId: user.id,
			code,
			expiresAt: new Date(Date.now() + emailVerificationCodeExpiresSpan.milliseconds()),
		});

		return { code: verificationCode };
	}
}
