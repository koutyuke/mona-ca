import { err } from "../../../common/utils";
import { isExpiredSignupSession } from "../../../domain/entities";
import type { SignupSessionToken } from "../../../domain/value-object";
import { parseSessionToken } from "../../../domain/value-object";
import { verifySessionSecret } from "../../../infrastructure/crypt";
import type { ISignupSessionRepository } from "../../../interface-adapter/repositories/signup-session";
import type { IValidateSignupSessionUseCase, ValidateSignupSessionUseCaseResult } from "../../ports/in";

export class ValidateSignupSessionUseCase implements IValidateSignupSessionUseCase {
	constructor(private readonly signupSessionRepository: ISignupSessionRepository) {}

	async execute(signupSessionToken: SignupSessionToken): Promise<ValidateSignupSessionUseCaseResult> {
		const signupSessionIdAndSecret = parseSessionToken(signupSessionToken);

		if (!signupSessionIdAndSecret) {
			return err("SIGNUP_SESSION_INVALID");
		}

		const { id: signupSessionId, secret: signupSessionSecret } = signupSessionIdAndSecret;

		const signupSession = await this.signupSessionRepository.findById(signupSessionId);

		if (!signupSession) {
			return err("SIGNUP_SESSION_INVALID");
		}

		if (!verifySessionSecret(signupSessionSecret, signupSession.secretHash)) {
			return err("SIGNUP_SESSION_INVALID");
		}

		if (isExpiredSignupSession(signupSession)) {
			await this.signupSessionRepository.deleteById(signupSessionId);
			return err("SIGNUP_SESSION_EXPIRED");
		}

		return { signupSession };
	}
}
