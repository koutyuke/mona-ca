import { err, ok } from "@mona-ca/core/utils";
import { isExpiredSignupSession } from "../../../domain/entities/signup-session";
import { parseAnySessionToken } from "../../../domain/value-objects/session-token";

import type { ISessionSecretHasher } from "../../../../../shared/ports/system";
import type { SignupSessionToken } from "../../../domain/value-objects/session-token";
import type {
	IValidateSignupSessionUseCase,
	ValidateSignupSessionUseCaseResult,
} from "../../contracts/basic-auth/validate-signup-session.usecase.interface";
import type { ISignupSessionRepository } from "../../ports/repositories/signup-session.repository.interface";

export class ValidateSignupSessionUseCase implements IValidateSignupSessionUseCase {
	constructor(
		private readonly signupSessionRepository: ISignupSessionRepository,
		private readonly sessionSecretHasher: ISessionSecretHasher,
	) {}

	async execute(signupSessionToken: SignupSessionToken): Promise<ValidateSignupSessionUseCaseResult> {
		const signupSessionIdAndSecret = parseAnySessionToken(signupSessionToken);

		if (!signupSessionIdAndSecret) {
			return err("SIGNUP_SESSION_INVALID");
		}

		const { id: signupSessionId, secret: signupSessionSecret } = signupSessionIdAndSecret;

		const signupSession = await this.signupSessionRepository.findById(signupSessionId);

		if (!signupSession) {
			return err("SIGNUP_SESSION_INVALID");
		}

		if (!this.sessionSecretHasher.verify(signupSessionSecret, signupSession.secretHash)) {
			return err("SIGNUP_SESSION_INVALID");
		}

		if (isExpiredSignupSession(signupSession)) {
			await this.signupSessionRepository.deleteById(signupSessionId);
			return err("SIGNUP_SESSION_EXPIRED");
		}

		return ok({ signupSession });
	}
}
