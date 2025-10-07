import { err, timingSafeStringEqual } from "../../../common/utils";
import { type SignupSession, completeEmailVerificationForSignupSession } from "../../../domain/entities";
import type { SignupSessionId } from "../../../domain/value-object";
import type { ISignupSessionRepository } from "../../../interface-adapter/repositories/signup-session";
import type {
	ISignupVerifyEmailUseCase,
	SignupVerifyEmailUseCaseResult,
} from "./interfaces/signup-verify-email.usecase.interface";

export class SignupVerifyEmailUseCase implements ISignupVerifyEmailUseCase {
	constructor(
		private readonly signupSessionRepository: ISignupSessionRepository,
		private readonly rateLimit: (signupSessionId: SignupSessionId) => Promise<void>,
	) {}

	async execute(code: string, signupSession: SignupSession): Promise<SignupVerifyEmailUseCaseResult> {
		await this.rateLimit(signupSession.id);

		if (signupSession.emailVerified) {
			return err("ALREADY_VERIFIED");
		}

		if (!timingSafeStringEqual(signupSession.code, code)) {
			return err("INVALID_VERIFICATION_CODE");
		}

		const updatedSession = completeEmailVerificationForSignupSession(signupSession);

		await this.signupSessionRepository.save(updatedSession);

		return;
	}
}
