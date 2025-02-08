import { emailVerificationCodeExpiresSpan } from "../../../common/constants";
import { generateRandomString, ulid } from "../../../common/utils";
import type { IEmailVerificationCodeRepository } from "../../../interface-adapter/repositories/email-verification-code";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { User } from "../../../models/entities/user";
import type {
	IEmailVerificationRequestUseCase,
	IEmailVerificationRequestUseCaseResult,
} from "./interface/email-verification-request.usecase.interface";

export class EmailVerificationRequestUseCase implements IEmailVerificationRequestUseCase {
	constructor(
		private emailVerificationCodeRepository: IEmailVerificationCodeRepository,
		private userRepository: IUserRepository,
	) {}

	public async execute(email: string, user: User): Promise<IEmailVerificationRequestUseCaseResult> {
		const sameEmailUser = await this.userRepository.findByEmail(email);

		if (email === user.email && user.emailVerified) {
			throw new Error("Email is already verified");
		}

		if (sameEmailUser && sameEmailUser.id !== user.id) {
			return { code: null };
		}

		const code = generateRandomString(8, {
			number: true,
		});

		await this.emailVerificationCodeRepository.delete({ userId: user.id });
		const result = await this.emailVerificationCodeRepository.create({
			id: ulid(),
			email,
			userId: user.id,
			code,
			expiresAt: new Date(Date.now() + emailVerificationCodeExpiresSpan.milliseconds()),
		});
		return { code: result };
	}
}
