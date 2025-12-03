import { err, ok } from "@mona-ca/core/utils";
import { timingSafeStringEqual } from "../../../../../core/lib/security";
import { completeEmailVerificationForSignupSession } from "../../../domain/entities/signup-session";

import type { SignupSession } from "../../../domain/entities/signup-session";
import type {
	ISignupVerifyCodeUseCase,
	SignupVerifyCodeUseCaseResult,
} from "../../contracts/signup/verify-code.usecase.interface";
import type { ISignupSessionRepository } from "../../ports/repositories/signup-session.repository.interface";

export class SignupVerifyCodeUseCase implements ISignupVerifyCodeUseCase {
	constructor(
		// repositories
		private readonly signupSessionRepository: ISignupSessionRepository,
	) {}

	async execute(code: string, signupSession: SignupSession): Promise<SignupVerifyCodeUseCaseResult> {
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
