import { err } from "../../../common/utils";
import { isExpiredSignupSession } from "../../../domain/entities";
import type { SignupSessionId } from "../../../domain/value-object";
import type { ISignupSessionRepository } from "../../../interface-adapter/repositories/signup-session";
import { type ISessionSecretService, separateSessionTokenToIdAndSecret } from "../../services/session";
import type {
	IValidateSignupSessionUseCase,
	ValidateSignupSessionUseCaseResult,
} from "./interfaces/validate-signup-session.usecase.interface";

export class ValidateSignupSessionUseCase implements IValidateSignupSessionUseCase {
	constructor(
		private readonly signupSessionRepository: ISignupSessionRepository,
		private readonly signupSessionSecretService: ISessionSecretService,
	) {}

	async execute(signupSessionToken: string): Promise<ValidateSignupSessionUseCaseResult> {
		const signupSessionIdAndSecret = separateSessionTokenToIdAndSecret<SignupSessionId>(signupSessionToken);

		if (!signupSessionIdAndSecret) {
			return err("SIGNUP_SESSION_INVALID");
		}

		const { id: signupSessionId, secret: signupSessionSecret } = signupSessionIdAndSecret;

		const signupSession = await this.signupSessionRepository.findById(signupSessionId);

		if (!signupSession) {
			return err("SIGNUP_SESSION_INVALID");
		}

		if (!this.signupSessionSecretService.verifySessionSecret(signupSessionSecret, signupSession.secretHash)) {
			return err("SIGNUP_SESSION_INVALID");
		}

		if (isExpiredSignupSession(signupSession)) {
			await this.signupSessionRepository.deleteById(signupSessionId);
			return err("SIGNUP_SESSION_EXPIRED");
		}

		return { signupSession };
	}
}
