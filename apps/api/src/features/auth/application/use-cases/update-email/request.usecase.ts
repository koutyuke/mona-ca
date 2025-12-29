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
	IUpdateEmailRequestUseCase,
	UpdateEmailRequestUseCaseResult,
} from "../../ports/in/update-email/request.usecase.interface";
import type { IAuthUserRepository } from "../../ports/out/repositories/auth-user.repository.interface";
import type { IEmailVerificationRequestRepository } from "../../ports/out/repositories/email-verification-request.repository.interface";

export class UpdateEmailRequestUseCase implements IUpdateEmailRequestUseCase {
	constructor(
		// repositories
		private readonly emailVerificationRequestRepository: IEmailVerificationRequestRepository,
		private readonly authUserRepository: IAuthUserRepository,
		// system
		private readonly cryptoRandomService: ICryptoRandomService,
		private readonly tokenSecretService: ITokenSecretService,
		private readonly emailGateway: IEmailGateway,
	) {}

	public async execute(email: string, userCredentials: UserCredentials): Promise<UpdateEmailRequestUseCaseResult> {
		if (email === userCredentials.email) {
			return err("EMAIL_ALREADY_REGISTERED");
		}

		const existingUserCredentialsForNewEmail = await this.authUserRepository.findByEmail(email);
		if (existingUserCredentialsForNewEmail) {
			return err("EMAIL_ALREADY_REGISTERED");
		}

		const { emailVerificationRequestToken, emailVerificationRequest } = this.createEmailVerificationRequest(
			email,
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
		const id = newEmailVerificationRequestId(ulid());
		const code = this.cryptoRandomService.string(8, {
			digits: true,
		});
		const secret = this.tokenSecretService.generateSecret();
		const secretHash = this.tokenSecretService.hash(secret);

		const emailVerificationRequest = createEmailVerificationRequest({
			id: id,
			email,
			userId,
			code,
			secretHash,
		});
		const emailVerificationRequestToken = encodeToken(id, secret);

		return { emailVerificationRequestToken, emailVerificationRequest };
	}
}
