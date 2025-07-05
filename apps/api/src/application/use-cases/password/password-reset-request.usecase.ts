import { err, generateRandomString, ulid } from "../../../common/utils";
import { createPasswordResetSession } from "../../../domain/entities";
import { newPasswordResetSessionId } from "../../../domain/value-object";
import type { IPasswordResetSessionRepository } from "../../../interface-adapter/repositories/password-reset-session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import { type ISessionSecretService, createSessionToken } from "../../services/session";
import type {
	IPasswordResetRequestUseCase,
	PasswordResetRequestUseCaseResult,
} from "./interfaces/password-reset-request.usecase.interface";

export class PasswordResetRequestUseCase implements IPasswordResetRequestUseCase {
	constructor(
		private readonly passwordResetSessionRepository: IPasswordResetSessionRepository,
		private readonly userRepository: IUserRepository,
		private readonly passwordResetSessionSecretService: ISessionSecretService,
	) {}

	public async execute(email: string): Promise<PasswordResetRequestUseCaseResult> {
		const user = await this.userRepository.findByEmail(email);

		if (user === null) {
			return err("USER_NOT_FOUND");
		}

		const code = generateRandomString(8, {
			number: true,
		});

		const passwordResetSessionSecret = this.passwordResetSessionSecretService.generateSessionSecret();
		const passwordResetSessionSecretHash =
			this.passwordResetSessionSecretService.hashSessionSecret(passwordResetSessionSecret);
		const passwordResetSessionId = newPasswordResetSessionId(ulid());
		const passwordResetSessionToken = createSessionToken(passwordResetSessionId, passwordResetSessionSecret);
		const passwordResetSession = createPasswordResetSession({
			id: passwordResetSessionId,
			userId: user.id,
			code,
			secretHash: passwordResetSessionSecretHash,
			email: user.email,
		});

		await this.passwordResetSessionRepository.deleteByUserId(user.id);
		await this.passwordResetSessionRepository.save(passwordResetSession);

		return {
			passwordResetSessionToken,
			passwordResetSession,
		};
	}
}
