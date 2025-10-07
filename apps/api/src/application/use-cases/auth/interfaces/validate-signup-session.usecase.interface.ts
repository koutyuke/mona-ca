import type { Err, Result } from "../../../../common/utils";
import type { SignupSession } from "../../../../domain/entities";

type Success = {
	signupSession: SignupSession;
};

type Error = Err<"SIGNUP_SESSION_INVALID"> | Err<"SIGNUP_SESSION_EXPIRED">;
export type ValidateSignupSessionUseCaseResult = Result<Success, Error>;

export interface IValidateSignupSessionUseCase {
	execute(signupSessionToken: string): Promise<ValidateSignupSessionUseCaseResult>;
}
