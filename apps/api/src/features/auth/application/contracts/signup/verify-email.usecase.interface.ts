import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { SignupSession } from "../../../domain/entities/signup-session";

type Success = Ok;
type Error = Err<"INVALID_VERIFICATION_CODE"> | Err<"ALREADY_VERIFIED">;

export type SignupVerifyEmailUseCaseResult = Result<Success, Error>;

export interface ISignupVerifyEmailUseCase {
	execute(code: string, signupSession: SignupSession): Promise<SignupVerifyEmailUseCaseResult>;
}
