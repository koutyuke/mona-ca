import type { User } from "../../../domain/entities/user";
import type { IEmailVerificationCodeRepository } from "../../../interface-adapter/repositories/email-verification-code";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { IChangeEmailUseCase, IChangeEmailUseCaseResult } from "./interfaces/change-email.usecase.interface";

export class ChangeEmailUseCase implements IChangeEmailUseCase {
	constructor(
		private userRepository: IUserRepository,
		private emailVerificationCodeRepository: IEmailVerificationCodeRepository,
	) {}

	public async execute(email: string, code: string, user: User): Promise<IChangeEmailUseCaseResult> {
		const [sameEmailUser, databaseCode] = await Promise.all([
			this.userRepository.findByEmail(email),
			this.emailVerificationCodeRepository.findByUserId(user.id),
		]);

		if (sameEmailUser || !databaseCode || databaseCode.code !== code) {
			return { success: false };
		}

		await this.emailVerificationCodeRepository.delete({ userId: user.id });

		if (databaseCode.isExpired || databaseCode.email === user.email) {
			return { success: false };
		}

		await this.userRepository.update(user.id, {
			email,
			emailVerified: true,
		});

		return { success: true };
	}
}
