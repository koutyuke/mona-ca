import { err, ok } from "@mona-ca/core/result";
import { ulid } from "../../../../../core/lib/id";
import { createSignupSession } from "../../../domain/entities/signup-session";
import { newSignupSessionId } from "../../../domain/value-objects/ids";
import { encodeToken } from "../../../domain/value-objects/tokens";

import type { IEmailGateway } from "../../../../../core/ports/gateways";
import type { ICryptoRandomService, ITokenSecretService } from "../../../../../core/ports/system";
import type { SignupSession } from "../../../domain/entities/signup-session";
import type { SignupSessionToken } from "../../../domain/value-objects/tokens";
import type {
	ISignupRequestUseCase,
	SignupRequestUseCaseResult,
} from "../../contracts/signup/request.usecase.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { ISignupSessionRepository } from "../../ports/repositories/signup-session.repository.interface";

export class SignupRequestUseCase implements ISignupRequestUseCase {
	constructor(
		// gateways
		private readonly emailGateway: IEmailGateway,
		// repositories
		private readonly authUserRepository: IAuthUserRepository,
		private readonly signupSessionRepository: ISignupSessionRepository,
		// system
		private readonly cryptoRandomService: ICryptoRandomService,
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	async execute(email: string): Promise<SignupRequestUseCaseResult> {
		const userCredentials = await this.authUserRepository.findByEmail(email);

		if (userCredentials) {
			return err("EMAIL_ALREADY_USED");
		}

		await this.signupSessionRepository.deleteByEmail(email);

		const { signupSessionToken, signupSession } = this.createSignupSession(email);

		await this.signupSessionRepository.save(signupSession);

		await this.emailGateway.sendVerificationEmail(signupSession.email, signupSession.code);

		return ok({
			signupSession,
			signupSessionToken,
		});
	}

	private createSignupSession(email: string): { signupSessionToken: SignupSessionToken; signupSession: SignupSession } {
		const id = newSignupSessionId(ulid());
		const code = this.cryptoRandomService.string(8, {
			digits: true,
		});
		const secret = this.tokenSecretService.generateSecret();
		const secretHash = this.tokenSecretService.hash(secret);

		const signupSession = createSignupSession({
			id,
			email,
			code,
			secretHash,
		});
		const signupSessionToken = encodeToken(id, secret);

		return { signupSessionToken, signupSession };
	}
}
