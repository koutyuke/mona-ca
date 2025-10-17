import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { SignupSessionToken } from "../../../../../../common/domain/value-objects";
import type { SignupSession } from "../../../../domain/entities";

type Success = Ok<{
	signupSessionToken: SignupSessionToken;
	signupSession: SignupSession;
}>;

type Error = Err<"EMAIL_ALREADY_USED">;

export type SignupRequestUseCaseResult = Result<Success, Error>;

export interface ISignupRequestUseCase {
	execute: (email: string) => Promise<SignupRequestUseCaseResult>;
}
