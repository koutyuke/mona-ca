import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { SignupSessionToken } from "../../../../../../common/domain/value-objects";
import type { SignupSession } from "../../../../domain/entities";

type Success = Ok<{
	signupSession: SignupSession;
}>;

type Error = Err<"SIGNUP_SESSION_INVALID"> | Err<"SIGNUP_SESSION_EXPIRED">;

export type ValidateSignupSessionUseCaseResult = Result<Success, Error>;

export interface IValidateSignupSessionUseCase {
	execute(signupSessionToken: SignupSessionToken): Promise<ValidateSignupSessionUseCaseResult>;
}
