import { err, ok } from "@mona-ca/core/result";
import { isExpiredEmailVerificationRequest } from "../../../domain/entities/email-verification-request";
import { decodeToken } from "../../../domain/value-objects/tokens";

import type { ITokenSecretService } from "../../../../../core/ports/system";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { EmailVerificationRequestToken } from "../../../domain/value-objects/tokens";
import type {
	EmailVerificationValidateRequestUseCaseResult,
	IEmailVerificationValidateRequestUseCase,
} from "../../ports/in/email-verification/validate-request.usecase.interface";
import type { IEmailVerificationRequestRepository } from "../../ports/out/repositories/email-verification-request.repository.interface";

export class EmailVerificationValidateRequestUseCase implements IEmailVerificationValidateRequestUseCase {
	constructor(
		// repositories
		private readonly emailVerificationRequestRepository: IEmailVerificationRequestRepository,
		// system
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	public async execute(
		userCredentials: UserCredentials,
		emailVerificationRequestToken: EmailVerificationRequestToken,
	): Promise<EmailVerificationValidateRequestUseCaseResult> {
		const emailVerificationRequestIdAndSecret = decodeToken(emailVerificationRequestToken);

		if (!emailVerificationRequestIdAndSecret) {
			return err("INVALID_EMAIL_VERIFICATION_REQUEST");
		}

		const { id: emailVerificationRequestId, secret: emailVerificationRequestSecret } =
			emailVerificationRequestIdAndSecret;

		const emailVerificationRequest = await this.emailVerificationRequestRepository.findById(emailVerificationRequestId);

		if (!emailVerificationRequest) {
			return err("INVALID_EMAIL_VERIFICATION_REQUEST");
		}

		if (emailVerificationRequest.userId !== userCredentials.id) {
			return err("INVALID_EMAIL_VERIFICATION_REQUEST");
		}

		if (!this.tokenSecretService.verify(emailVerificationRequestSecret, emailVerificationRequest.secretHash)) {
			return err("INVALID_EMAIL_VERIFICATION_REQUEST");
		}

		if (isExpiredEmailVerificationRequest(emailVerificationRequest)) {
			await this.emailVerificationRequestRepository.deleteByUserId(emailVerificationRequest.userId);
			return err("EXPIRED_EMAIL_VERIFICATION_REQUEST");
		}

		return ok({ emailVerificationRequest });
	}
}
