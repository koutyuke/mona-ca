import { err } from "../../../common/utils";
import { User } from "../../../domain/entities";
import type { IEmailVerificationRepository } from "../../../interface-adapter/repositories/email-verification";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type {
	EmailVerificationConfirmUseCaseResult,
	IEmailVerificationConfirmUseCase,
} from "./interfaces/email-verification-confirm.usecase.interface";

export class EmailVerificationConfirmUseCase implements IEmailVerificationConfirmUseCase {
	constructor(
		private emailVerificationRepository: IEmailVerificationRepository,
		private userRepository: IUserRepository,
	) {}

	public async execute(code: string, user: User): Promise<EmailVerificationConfirmUseCaseResult> {
		const databaseCode = await this.emailVerificationRepository.findByUserId(user.id);

		if (!databaseCode || databaseCode.code !== code) {
			return err("INVALID_CODE");
		}

		await this.emailVerificationRepository.deleteByUserId(user.id);

		if (databaseCode.isExpired || databaseCode.email !== user.email) {
			return err("INVALID_CODE");
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
