import { err, ok } from "@mona-ca/core/utils";
import { ulid } from "../../../../../shared/lib/id";
import { createSignupSession } from "../../../domain/entities/signup-session";
import { newSignupSessionId } from "../../../domain/value-objects/ids";
import { formatAnySessionToken } from "../../../domain/value-objects/session-token";

import type { IEmailGateway } from "../../../../../shared/ports/gateways";
import type { IRandomGenerator, ISessionSecretHasher } from "../../../../../shared/ports/system";
import type { SignupSession } from "../../../domain/entities/signup-session";
import type { SignupSessionToken } from "../../../domain/value-objects/session-token";
import type {
	ISignupRequestUseCase,
	SignupRequestUseCaseResult,
} from "../../contracts/basic-auth/signup-request.usecase.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { ISignupSessionRepository } from "../../ports/repositories/signup-session.repository.interface";

export class SignupRequestUseCase implements ISignupRequestUseCase {
	constructor(
		private readonly signupSessionRepository: ISignupSessionRepository,
		private readonly authUserRepository: IAuthUserRepository,
		private readonly sessionSecretHasher: ISessionSecretHasher,
		private readonly randomGenerator: IRandomGenerator,
		private readonly emailGateway: IEmailGateway,
	) {}

	async execute(email: string): Promise<SignupRequestUseCaseResult> {
		const userIdentity = await this.authUserRepository.findByEmail(email);

		if (userIdentity) {
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
		const code = this.randomGenerator.string(8, {
			digits: true,
		});

		const signupSessionSecret = this.sessionSecretHasher.generate();
		const signupSessionSecretHash = this.sessionSecretHasher.hash(signupSessionSecret);
		const signupSessionId = newSignupSessionId(ulid());
		const signupSession = createSignupSession({
			id: signupSessionId,
			email,
			code,
			secretHash: signupSessionSecretHash,
		});
		const signupSessionToken = formatAnySessionToken(signupSessionId, signupSessionSecret);

		return { signupSessionToken, signupSession };
	}
}
