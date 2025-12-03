import { err, ok } from "@mona-ca/core/utils";
import { ulid } from "../../../../../core/lib/id";
import { createPasswordResetSession } from "../../../domain/entities/password-reset-session";
import { newPasswordResetSessionId } from "../../../domain/value-objects/ids";
import { encodeToken } from "../../../domain/value-objects/tokens";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { IEmailGateway } from "../../../../../core/ports/gateways";
import type { ICryptoRandomService, ITokenSecretService } from "../../../../../core/ports/system";
import type { PasswordResetSession } from "../../../domain/entities/password-reset-session";
import type { PasswordResetSessionToken } from "../../../domain/value-objects/tokens";
import type {
	IPasswordResetRequestUseCase,
	PasswordResetRequestUseCaseResult,
} from "../../contracts/password-reset/request.usecase.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { IPasswordResetSessionRepository } from "../../ports/repositories/password-reset-session.repository.interface";

export class PasswordResetRequestUseCase implements IPasswordResetRequestUseCase {
	constructor(
		// repositories
		private readonly authUserRepository: IAuthUserRepository,
		private readonly passwordResetSessionRepository: IPasswordResetSessionRepository,
		// system
		private readonly cryptoRandomService: ICryptoRandomService,
		private readonly emailGateway: IEmailGateway,
		private readonly tokenSecretService: ITokenSecretService,
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
		const code = this.cryptoRandomService.string(8, {
			digits: true,
		});
		const id = newPasswordResetSessionId(ulid());
		const secret = this.tokenSecretService.generateSecret();
		const secretHash = this.tokenSecretService.hash(secret);

		const passwordResetSession = createPasswordResetSession({
			id,
			userId,
			code,
			secretHash,
			email,
		});
		const passwordResetSessionToken = encodeToken(id, secret);

		return { passwordResetSessionToken, passwordResetSession };
	}
}
