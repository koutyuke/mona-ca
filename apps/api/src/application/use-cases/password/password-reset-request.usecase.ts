import { err, ulid } from "../../../common/utils";
import { createPasswordResetSession } from "../../../domain/entities";
import { formatSessionToken, newPasswordResetSessionId } from "../../../domain/value-object";
import { generateRandomString, generateSessionSecret, hashSessionSecret } from "../../../infrastructure/crypt";
import type { IPasswordResetSessionRepository } from "../../../interface-adapter/repositories/password-reset-session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { IPasswordResetRequestUseCase, PasswordResetRequestUseCaseResult } from "../../ports/in";

export class PasswordResetRequestUseCase implements IPasswordResetRequestUseCase {
	constructor(
		private readonly passwordResetSessionRepository: IPasswordResetSessionRepository,
		private readonly userRepository: IUserRepository,
	) {}

	public async execute(email: string): Promise<PasswordResetRequestUseCaseResult> {
		const user = await this.userRepository.findByEmail(email);

		if (user === null) {
			return err("USER_NOT_FOUND");
		}

		const code = generateRandomString(8, {
			number: true,
		});

		const passwordResetSessionSecret = generateSessionSecret();
		const passwordResetSessionSecretHash = hashSessionSecret(passwordResetSessionSecret);
		const passwordResetSessionId = newPasswordResetSessionId(ulid());
		const passwordResetSessionToken = formatSessionToken(passwordResetSessionId, passwordResetSessionSecret);
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
