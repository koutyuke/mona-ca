import type { Err, Result } from "../../../../common/utils";
import type { SignupSession } from "../../../../domain/entities";

type Success = undefined;
type Error = Err<"INVALID_VERIFICATION_CODE"> | Err<"ALREADY_VERIFIED">;
export type SignupVerifyEmailUseCaseResult = Result<Success, Error>;

export interface ISignupVerifyEmailUseCase {
	execute: (code: string, signupSession: SignupSession) => Promise<SignupVerifyEmailUseCaseResult>;
}
