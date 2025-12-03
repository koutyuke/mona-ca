import { err, ok } from "@mona-ca/core/utils";
import { ulid } from "../../../../../core/lib/id";
import { createEmailVerificationSession } from "../../../domain/entities/email-verification-session";
import { newEmailVerificationSessionId } from "../../../domain/value-objects/ids";
import { encodeToken } from "../../../domain/value-objects/tokens";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { IEmailGateway } from "../../../../../core/ports/gateways";
import type { ICryptoRandomService, ITokenSecretService } from "../../../../../core/ports/system";
import type { EmailVerificationSession } from "../../../domain/entities/email-verification-session";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { EmailVerificationSessionToken } from "../../../domain/value-objects/tokens";
import type {
	EmailVerificationRequestUseCaseResult,
	IEmailVerificationRequestUseCase,
} from "../../contracts/email-verification/request.usecase.interface";
import type { IEmailVerificationSessionRepository } from "../../ports/repositories/email-verification-session.repository.interface";

export class EmailVerificationRequestUseCase implements IEmailVerificationRequestUseCase {
	constructor(
		// gateways
		private readonly emailGateway: IEmailGateway,
		// repositories
		private readonly emailVerificationSessionRepository: IEmailVerificationSessionRepository,
		// system
		private readonly cryptoRandomService: ICryptoRandomService,
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	public async execute(userCredentials: UserCredentials): Promise<EmailVerificationRequestUseCaseResult> {
		if (userCredentials.emailVerified) {
			return err("EMAIL_ALREADY_VERIFIED");
		}

		const { emailVerificationSessionToken, emailVerificationSession } = this.createEmailVerificationSession(
			userCredentials.email,
			userCredentials.id,
		);

		await this.emailVerificationSessionRepository.deleteByUserId(userCredentials.id);
		await this.emailVerificationSessionRepository.save(emailVerificationSession);

		await this.emailGateway.sendVerificationEmail(emailVerificationSession.email, emailVerificationSession.code);

		return ok({
			emailVerificationSessionToken,
			emailVerificationSession,
		});
	}

	private createEmailVerificationSession(
		email: string,
		userId: UserId,
	): {
		emailVerificationSessionToken: EmailVerificationSessionToken;
		emailVerificationSession: EmailVerificationSession;
	} {
		const code = this.cryptoRandomService.string(8, {
			digits: true,
		});
		const emailVerificationSessionSecret = this.tokenSecretService.generateSecret();
		const secretHash = this.tokenSecretService.hash(emailVerificationSessionSecret);
		const emailVerificationSessionId = newEmailVerificationSessionId(ulid());
		const emailVerificationSessionToken = encodeToken(emailVerificationSessionId, emailVerificationSessionSecret);
		const emailVerificationSession = createEmailVerificationSession({
			id: emailVerificationSessionId,
			email,
			userId,
			code,
			secretHash,
		});
		return { emailVerificationSessionToken, emailVerificationSession };
	}
}
