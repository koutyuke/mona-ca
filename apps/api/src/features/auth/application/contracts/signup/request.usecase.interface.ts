import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { SignupSession } from "../../../domain/entities/signup-session";
import type { SignupSessionToken } from "../../../domain/value-objects/tokens";

type Success = Ok<{
	signupSession: SignupSession;
	signupSessionToken: SignupSessionToken;
}>;

type Error = Err<"EMAIL_ALREADY_USED">;

export type SignupRequestUseCaseResult = Result<Success, Error>;

export interface ISignupRequestUseCase {
	execute(email: string): Promise<SignupRequestUseCaseResult>;
}
