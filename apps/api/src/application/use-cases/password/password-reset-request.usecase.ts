import { err, generateRandomString } from "../../../common/utils";
import { createPasswordResetSession } from "../../../domain/entities";
import { newPasswordResetSessionId } from "../../../domain/value-object";
import type { IPasswordResetSessionRepository } from "../../../interface-adapter/repositories/password-reset-session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { ISessionTokenService } from "../../services/session-token";
import type {
	IPasswordResetRequestUseCase,
	PasswordResetRequestUseCaseResult,
} from "./interfaces/password-reset-request.usecase.interface";

export class PasswordResetRequestUseCase implements IPasswordResetRequestUseCase {
	constructor(
		private readonly passwordResetSessionRepository: IPasswordResetSessionRepository,
		private readonly userRepository: IUserRepository,
		private readonly passwordResetSessionTokenService: ISessionTokenService,
	) {}

	public async execute(email: string): Promise<PasswordResetRequestUseCaseResult> {
		const user = await this.userRepository.findByEmail(email);

		if (user === null) {
			return err("EMAIL_IS_NOT_VERIFIED");
		}

		const code = generateRandomString(8, {
			number: true,
		});

		const passwordResetSessionToken = this.passwordResetSessionTokenService.generateSessionToken();
		const passwordResetSessionId = newPasswordResetSessionId(
			this.passwordResetSessionTokenService.hashSessionToken(passwordResetSessionToken),
		);

		const passwordResetSession = createPasswordResetSession({
			id: passwordResetSessionId,
			userId: user.id,
			code,
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
