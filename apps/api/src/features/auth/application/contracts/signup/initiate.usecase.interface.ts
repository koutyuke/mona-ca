import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { SignupSession } from "../../../domain/entities/signup-session";
import type { SignupSessionToken } from "../../../domain/value-objects/tokens";

type Success = Ok<{
	signupSession: SignupSession;
	signupSessionToken: SignupSessionToken;
}>;

type Error = Err<"EMAIL_ALREADY_USED">;

export type SignupInitiateUseCaseResult = Result<Success, Error>;

export interface ISignupInitiateUseCase {
	execute(email: string): Promise<SignupInitiateUseCaseResult>;
}
