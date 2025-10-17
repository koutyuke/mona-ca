import { err, ok } from "@mona-ca/core/utils";
import type {
	IValidateSignupSessionUseCase,
	ValidateSignupSessionUseCaseResult,
} from "../../../../../application/ports/in";
import type { SignupSessionToken } from "../../../../../common/domain/value-objects";
import { parseSessionToken } from "../../../../../common/domain/value-objects";
import type { ISessionSecretHasher } from "../../../../../common/ports/system";
import { isExpiredSignupSession } from "../../../domain/entities";
import type { ISignupSessionRepository } from "../../ports/out/repositories";

export class ValidateSignupSessionUseCase implements IValidateSignupSessionUseCase {
	constructor(
		private readonly signupSessionRepository: ISignupSessionRepository,
		private readonly sessionSecretHasher: ISessionSecretHasher,
	) {}

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
