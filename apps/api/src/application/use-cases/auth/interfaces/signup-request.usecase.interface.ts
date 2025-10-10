import type { Err, Result } from "../../../../common/utils";
import type { SignupSession } from "../../../../domain/entities";
import type { SignupSessionToken } from "../../../../domain/value-object";

type Success = {
	signupSessionToken: SignupSessionToken;
	signupSession: SignupSession;
};

type Error = Err<"EMAIL_ALREADY_USED">;

export type SignupRequestUseCaseResult = Result<Success, Error>;

export interface ISignupRequestUseCase {
	execute: (email: string) => Promise<SignupRequestUseCaseResult>;
}
