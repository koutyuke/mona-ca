import { err, ok } from "@mona-ca/core/utils";
import { ulid } from "../../../../../shared/lib/id";
import { createPasswordResetSession } from "../../../domain/entities/password-reset-session";
import { newPasswordResetSessionId } from "../../../domain/value-objects/ids";
import { formatAnySessionToken } from "../../../domain/value-objects/session-token";

import type { UserId } from "../../../../../shared/domain/value-objects";
import type { IEmailGateway } from "../../../../../shared/ports/gateways";
import type { IRandomGenerator, ISessionSecretHasher } from "../../../../../shared/ports/system";
import type { PasswordResetSession } from "../../../domain/entities/password-reset-session";
import type { PasswordResetSessionToken } from "../../../domain/value-objects/session-token";
import type {
	IPasswordResetRequestUseCase,
	PasswordResetRequestUseCaseResult,
} from "../../contracts/password/password-reset-request.usecase.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { IPasswordResetSessionRepository } from "../../ports/repositories/password-reset-session.repository.interface";

export class PasswordResetRequestUseCase implements IPasswordResetRequestUseCase {
	constructor(
		private readonly authUserRepository: IAuthUserRepository,
		private readonly passwordResetSessionRepository: IPasswordResetSessionRepository,
		private readonly randomGenerator: IRandomGenerator,
		private readonly sessionSecretHasher: ISessionSecretHasher,
		private readonly emailGateway: IEmailGateway,
	) {}

	public async execute(email: string): Promise<PasswordResetRequestUseCaseResult> {
		const userIdentity = await this.authUserRepository.findByEmail(email);

		if (!userIdentity) {
			return err("USER_NOT_FOUND");
		}

		const { passwordResetSessionToken, passwordResetSession } = this.createPasswordResetSession(
			userIdentity.id,
			userIdentity.email,
		);

		await this.passwordResetSessionRepository.deleteByUserId(userIdentity.id);
		await this.passwordResetSessionRepository.save(passwordResetSession);

		await this.emailGateway.sendVerificationEmail(passwordResetSession.email, passwordResetSession.code);

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
		const passwordResetSessionToken = formatAnySessionToken(passwordResetSessionId, passwordResetSessionSecret);
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
