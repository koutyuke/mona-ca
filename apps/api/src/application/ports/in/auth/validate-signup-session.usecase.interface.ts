import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { SignupSession } from "../../../../domain/entities";
import type { SignupSessionToken } from "../../../../domain/value-objects";

type Success = Ok<{
	signupSession: SignupSession;
}>;

type Error = Err<"SIGNUP_SESSION_INVALID"> | Err<"SIGNUP_SESSION_EXPIRED">;

export type ValidateSignupSessionUseCaseResult = Result<Success, Error>;

export interface IValidateSignupSessionUseCase {
	execute(signupSessionToken: SignupSessionToken): Promise<ValidateSignupSessionUseCaseResult>;
}
