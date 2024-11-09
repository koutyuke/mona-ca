import type { User } from "@/domain/user";
import type { IEmailVerificationCodeRepository } from "@/interface-adapter/repositories/email-verification-code";
import type { IUserRepository } from "@/interface-adapter/repositories/user";
import type {
	IEmailVerificationConfirmUseCase,
	IEmailVerificationConfirmUseCaseResult,
} from "./interface/email-verification-confirm.usecase.interface";

export class EmailVerificationConfirmUseCase implements IEmailVerificationConfirmUseCase {
	constructor(
		private emailVerificationCodeRepository: IEmailVerificationCodeRepository,
		private userRepository: IUserRepository,
	) {}

	public async execute(code: string, user: User): Promise<IEmailVerificationConfirmUseCaseResult> {
		const databaseCode = await this.emailVerificationCodeRepository.findByUserId(user.id);

		if (!databaseCode || databaseCode.code !== code) {
			return { success: false };
		}

		await this.emailVerificationCodeRepository.delete({ userId: user.id });

		if (databaseCode.isExpired || databaseCode.email !== user.email) {
			return { success: false };
		}

		await this.userRepository.update(user.id, {
			emailVerified: true,
		});

		return { success: true };
	}
}
