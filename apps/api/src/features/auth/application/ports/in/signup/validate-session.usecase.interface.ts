import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { SignupSession } from "../../../../domain/entities/signup-session";
import type { SignupSessionToken } from "../../../../domain/value-objects/tokens";

type Success = Ok<{
	signupSession: SignupSession;
}>;

type Error = Err<"SIGNUP_SESSION_INVALID"> | Err<"SIGNUP_SESSION_EXPIRED">;

export type SignupValidateSessionUseCaseResult = Result<Success, Error>;

export interface ISignupValidateSessionUseCase {
	execute(signupSessionToken: SignupSessionToken): Promise<SignupValidateSessionUseCaseResult>;
}
