import { err, ok } from "@mona-ca/core/result";
import { isExpiredSignupSession } from "../../../domain/entities/signup-session";
import { decodeToken } from "../../../domain/value-objects/tokens";

import type { ITokenSecretService } from "../../../../../core/ports/system";
import type { SignupSessionToken } from "../../../domain/value-objects/tokens";
import type {
	ISignupValidateSessionUseCase,
	SignupValidateSessionUseCaseResult,
} from "../../contracts/signup/validate-session.usecase.interface";
import type { ISignupSessionRepository } from "../../ports/repositories/signup-session.repository.interface";

export class SignupValidateSessionUseCase implements ISignupValidateSessionUseCase {
	constructor(
		// repositories
		private readonly signupSessionRepository: ISignupSessionRepository,
		// system
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	async execute(signupSessionToken: SignupSessionToken): Promise<SignupValidateSessionUseCaseResult> {
		const idAndSecret = decodeToken(signupSessionToken);

		if (!idAndSecret) {
			return err("SIGNUP_SESSION_INVALID");
		}

		const { id: signupSessionId, secret: signupSessionSecret } = idAndSecret;

		const signupSession = await this.signupSessionRepository.findById(signupSessionId);

		if (!signupSession) {
			return err("SIGNUP_SESSION_INVALID");
		}

		if (!this.tokenSecretService.verify(signupSessionSecret, signupSession.secretHash)) {
			return err("SIGNUP_SESSION_INVALID");
		}

		if (isExpiredSignupSession(signupSession)) {
			await this.signupSessionRepository.deleteById(signupSessionId);
			return err("SIGNUP_SESSION_EXPIRED");
		}

		return ok({ signupSession });
	}
}
