import { err, ok } from "@mona-ca/core/result";
import { ulid } from "../../../../../core/lib/id";
import { createEmailVerificationRequest } from "../../../domain/entities/email-verification-request";
import { newEmailVerificationRequestId } from "../../../domain/value-objects/ids";
import { encodeToken } from "../../../domain/value-objects/tokens";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { IEmailGateway } from "../../../../../core/ports/gateways";
import type { ICryptoRandomService, ITokenSecretService } from "../../../../../core/ports/system";
import type { EmailVerificationRequest } from "../../../domain/entities/email-verification-request";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { EmailVerificationRequestToken } from "../../../domain/value-objects/tokens";
import type {
	EmailVerificationRequestUseCaseResult,
	IEmailVerificationRequestUseCase,
} from "../../contracts/email-verification/request.usecase.interface";
import type { IEmailVerificationRequestRepository } from "../../ports/repositories/email-verification-request.repository.interface";

export class EmailVerificationRequestUseCase implements IEmailVerificationRequestUseCase {
	constructor(
		// gateways
		private readonly emailGateway: IEmailGateway,
		// repositories
		private readonly emailVerificationRequestRepository: IEmailVerificationRequestRepository,
		// system
		private readonly cryptoRandomService: ICryptoRandomService,
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	public async execute(userCredentials: UserCredentials): Promise<EmailVerificationRequestUseCaseResult> {
		if (userCredentials.emailVerified) {
			return err("EMAIL_ALREADY_VERIFIED");
		}

		const { emailVerificationRequestToken, emailVerificationRequest } = this.createEmailVerificationRequest(
			userCredentials.email,
			userCredentials.id,
		);

		await this.emailVerificationRequestRepository.deleteByUserId(userCredentials.id);
		await this.emailVerificationRequestRepository.save(emailVerificationRequest);

		await this.emailGateway.sendVerificationEmail(emailVerificationRequest.email, emailVerificationRequest.code);

		return ok({
			emailVerificationRequestToken,
			emailVerificationRequest,
		});
	}

	private createEmailVerificationRequest(
		email: string,
		userId: UserId,
	): {
		emailVerificationRequestToken: EmailVerificationRequestToken;
		emailVerificationRequest: EmailVerificationRequest;
	} {
		const code = this.cryptoRandomService.string(8, {
			digits: true,
		});
		const emailVerificationRequestSecret = this.tokenSecretService.generateSecret();
		const secretHash = this.tokenSecretService.hash(emailVerificationRequestSecret);
		const emailVerificationRequestId = newEmailVerificationRequestId(ulid());
		const emailVerificationRequestToken = encodeToken(emailVerificationRequestId, emailVerificationRequestSecret);
		const emailVerificationRequest = createEmailVerificationRequest({
			id: emailVerificationRequestId,
			email,
			userId,
			code,
			secretHash: Buffer.from(secretHash),
		});
		return { emailVerificationRequestToken, emailVerificationRequest };
	}
}
