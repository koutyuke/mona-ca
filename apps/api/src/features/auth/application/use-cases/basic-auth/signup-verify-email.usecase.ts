import { err, ok } from "@mona-ca/core/utils";
import { timingSafeStringEqual } from "../../../../../core/lib/security";
import { completeEmailVerificationForSignupSession } from "../../../domain/entities/signup-session";

import type { SignupSession } from "../../../domain/entities/signup-session";
import type {
	ISignupVerifyEmailUseCase,
	SignupVerifyEmailUseCaseResult,
} from "../../contracts/basic-auth/signup-verify-email.usecase.interface";
import type { ISignupSessionRepository } from "../../ports/repositories/signup-session.repository.interface";

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
