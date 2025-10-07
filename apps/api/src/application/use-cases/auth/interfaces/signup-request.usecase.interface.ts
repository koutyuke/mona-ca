import type { Err, Result } from "../../../../common/utils";
import type { SignupSession } from "../../../../domain/entities";

type Success = {
	signupSessionToken: string;
	signupSession: SignupSession;
};

type Error = Err<"EMAIL_ALREADY_USED">;

export type SignupRequestUseCaseResult = Result<Success, Error>;

export interface ISignupRequestUseCase {
	execute: (email: string) => Promise<SignupRequestUseCaseResult>;
}
