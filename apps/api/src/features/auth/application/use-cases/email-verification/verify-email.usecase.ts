import { err, ok } from "@mona-ca/core/result";
import { timingSafeStringEqual } from "../../../../../core/lib/security";
import { updateUserCredentials } from "../../../domain/entities/user-credentials";

import type { EmailVerificationRequest } from "../../../domain/entities/email-verification-request";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type {
	EmailVerificationVerifyEmailUseCaseResult,
	IEmailVerificationVerifyEmailUseCase,
} from "../../ports/in/email-verification/verify-email.usecase.interface";
import type { IAuthUserRepository } from "../../ports/out/repositories/auth-user.repository.interface";
import type { IEmailVerificationRequestRepository } from "../../ports/out/repositories/email-verification-request.repository.interface";

export class EmailVerificationVerifyEmailUseCase implements IEmailVerificationVerifyEmailUseCase {
	constructor(
		// repositories
		private readonly authUserRepository: IAuthUserRepository,
		private readonly emailVerificationRequestRepository: IEmailVerificationRequestRepository,
	) {}

	/**
	 * this use case will be called after the validate email verification session use case.
	 *
	 * so we don't need to check the expired email verification session.
	 */
	public async execute(
		code: string,
		userCredentials: UserCredentials,
		emailVerificationRequest: EmailVerificationRequest,
	): Promise<EmailVerificationVerifyEmailUseCaseResult> {
		if (!timingSafeStringEqual(emailVerificationRequest.code, code)) {
			return err("INVALID_CODE");
		}

		if (emailVerificationRequest.email !== userCredentials.email) {
			await this.emailVerificationRequestRepository.deleteByUserId(userCredentials.id);
			return err("INVALID_EMAIL");
		}

		const updatedUserCredentials = updateUserCredentials(userCredentials, {
			emailVerified: true,
		});

		await Promise.all([
			this.emailVerificationRequestRepository.deleteByUserId(userCredentials.id),
			this.authUserRepository.update(updatedUserCredentials),
		]);

		return ok();
	}
}
