import { User } from "../../../domain/entities";
import type { IEmailVerificationRepository } from "../../../interface-adapter/repositories/email-verification";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { IChangeEmailUseCase, IChangeEmailUseCaseResult } from "./interfaces/change-email.usecase.interface";

export class ChangeEmailUseCase implements IChangeEmailUseCase {
	constructor(
		private userRepository: IUserRepository,
		private emailVerificationRepository: IEmailVerificationRepository,
	) {}

	public async execute(email: string, code: string, user: User): Promise<IChangeEmailUseCaseResult> {
		const [sameEmailUser, databaseCode] = await Promise.all([
			this.userRepository.findByEmail(email),
			this.emailVerificationRepository.findByUserId(user.id),
		]);

		if (sameEmailUser || !databaseCode || databaseCode.code !== code) {
			return { success: false };
		}

		await this.emailVerificationRepository.deleteByUserId(user.id);

		if (databaseCode.isExpired || databaseCode.email === user.email) {
			return { success: false };
		}

		const updatedUser = new User({
			...user,
			emailVerified: true,
			email,
			updatedAt: new Date(),
		});

		await this.userRepository.save(updatedUser);

		return { success: true };
	}
}
