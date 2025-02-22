import { err } from "../../../common/utils";
import type { User } from "../../../domain/entities/user";
import type { IEmailVerificationCodeRepository } from "../../../interface-adapter/repositories/email-verification-code";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type {
	EmailVerificationConfirmUseCaseResult,
	IEmailVerificationConfirmUseCase,
} from "./interfaces/email-verification-confirm.usecase.interface";

export class EmailVerificationConfirmUseCase implements IEmailVerificationConfirmUseCase {
	constructor(
		private emailVerificationCodeRepository: IEmailVerificationCodeRepository,
		private userRepository: IUserRepository,
	) {}

	public async execute(code: string, user: User): Promise<EmailVerificationConfirmUseCaseResult> {
		const databaseCode = await this.emailVerificationCodeRepository.findByUserId(user.id);

		if (!databaseCode || databaseCode.code !== code) {
			return err("INVALID_CODE");
		}

		await this.emailVerificationCodeRepository.delete({ userId: user.id });

		if (databaseCode.isExpired || databaseCode.email !== user.email) {
			return err("INVALID_CODE");
		}

		await this.userRepository.update(user.id, {
			emailVerified: true,
		});

		return;
	}
}
