import { err, ok } from "@mona-ca/core/result";
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
	IUpdateEmailRequestUseCase,
	UpdateEmailRequestUseCaseResult,
} from "../../contracts/update-email/request.usecase.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { IEmailVerificationSessionRepository } from "../../ports/repositories/email-verification-session.repository.interface";

export class UpdateEmailRequestUseCase implements IUpdateEmailRequestUseCase {
	constructor(
		// repositories
		private readonly emailVerificationSessionRepository: IEmailVerificationSessionRepository,
		private readonly authUserRepository: IAuthUserRepository,
		// system
		private readonly cryptoRandomService: ICryptoRandomService,
		private readonly tokenSecretService: ITokenSecretService,
		private readonly emailGateway: IEmailGateway,
	) {}

	public async execute(email: string, userCredentials: UserCredentials): Promise<UpdateEmailRequestUseCaseResult> {
		const existingUserCredentialsForNewEmail = await this.authUserRepository.findByEmail(email);
		if (existingUserCredentialsForNewEmail) {
			return err("EMAIL_ALREADY_REGISTERED");
		}

		const { emailVerificationSessionToken, emailVerificationSession } = this.createEmailVerificationSession(
			email,
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
		const id = newEmailVerificationSessionId(ulid());
		const code = this.cryptoRandomService.string(8, {
			digits: true,
		});
		const secret = this.tokenSecretService.generateSecret();
		const secretHash = this.tokenSecretService.hash(secret);

		const emailVerificationSession = createEmailVerificationSession({
			id: id,
			email,
			userId,
			code,
			secretHash,
		});
		const emailVerificationSessionToken = encodeToken(id, secret);

		return { emailVerificationSessionToken, emailVerificationSession };
	}
}
