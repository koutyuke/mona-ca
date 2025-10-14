import { err, ok } from "@mona-ca/core/utils";
import { ulid } from "../../../common/utils";
import { type PasswordResetSession, createPasswordResetSession } from "../../../domain/entities";
import {
	type PasswordResetSessionToken,
	type UserId,
	formatSessionToken,
	newPasswordResetSessionId,
} from "../../../domain/value-objects";
import type { IPasswordResetRequestUseCase, PasswordResetRequestUseCaseResult } from "../../ports/in";
import type { IPasswordResetSessionRepository, IUserRepository } from "../../ports/out/repositories";
import type { IRandomGenerator, ISessionSecretHasher } from "../../ports/out/system";

export class PasswordResetRequestUseCase implements IPasswordResetRequestUseCase {
	constructor(
		private readonly passwordResetSessionRepository: IPasswordResetSessionRepository,
		private readonly userRepository: IUserRepository,
		private readonly randomGenerator: IRandomGenerator,
		private readonly sessionSecretHasher: ISessionSecretHasher,
	) {}

	public async execute(email: string): Promise<PasswordResetRequestUseCaseResult> {
		const user = await this.userRepository.findByEmail(email);

		if (user === null) {
			return err("USER_NOT_FOUND");
		}

		const { passwordResetSessionToken, passwordResetSession } = this.createPasswordResetSession(user.id, user.email);

		await this.passwordResetSessionRepository.deleteByUserId(user.id);
		await this.passwordResetSessionRepository.save(passwordResetSession);

		return ok({
			passwordResetSessionToken,
			passwordResetSession,
		});
	}

	private createPasswordResetSession(
		userId: UserId,
		email: string,
	): {
		passwordResetSessionToken: PasswordResetSessionToken;
		passwordResetSession: PasswordResetSession;
	} {
		const code = this.randomGenerator.string(8, {
			digits: true,
		});
		const passwordResetSessionSecret = this.sessionSecretHasher.generate();
		const passwordResetSessionSecretHash = this.sessionSecretHasher.hash(passwordResetSessionSecret);
		const passwordResetSessionId = newPasswordResetSessionId(ulid());
		const passwordResetSessionToken = formatSessionToken(passwordResetSessionId, passwordResetSessionSecret);
		const passwordResetSession = createPasswordResetSession({
			id: passwordResetSessionId,
			userId,
			code,
			secretHash: passwordResetSessionSecretHash,
			email,
		});

		return { passwordResetSessionToken, passwordResetSession };
	}
}
