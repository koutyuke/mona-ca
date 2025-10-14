import { err, ok } from "@mona-ca/core/utils";
import { timingSafeStringEqual } from "../../../common/utils";
import { type SignupSession, completeEmailVerificationForSignupSession } from "../../../domain/entities";
import type { ISignupVerifyEmailUseCase, SignupVerifyEmailUseCaseResult } from "../../ports/in";
import type { ISignupSessionRepository } from "../../ports/out/repositories";

export class SignupVerifyEmailUseCase implements ISignupVerifyEmailUseCase {
	constructor(private readonly signupSessionRepository: ISignupSessionRepository) {}

	async execute(code: string, signupSession: SignupSession): Promise<SignupVerifyEmailUseCaseResult> {
		if (signupSession.emailVerified) {
			return err("ALREADY_VERIFIED");
		}

		if (!timingSafeStringEqual(signupSession.code, code)) {
			return err("INVALID_VERIFICATION_CODE");
		}

		const updatedSession = completeEmailVerificationForSignupSession(signupSession);

		await this.signupSessionRepository.save(updatedSession);

		return ok();
	}
}
