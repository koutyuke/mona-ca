import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { Gender } from "../../../../../../core/domain/value-objects";
import type { Session } from "../../../../domain/entities/session";
import type { SignupSession } from "../../../../domain/entities/signup-session";
import type { SessionToken } from "../../../../domain/value-objects/tokens";

type Success = Ok<{
	session: Session;
	sessionToken: SessionToken;
}>;

type Error = Err<"EMAIL_ALREADY_REGISTERED"> | Err<"EMAIL_VERIFICATION_REQUIRED">;

export type SignupRegisterUseCaseResult = Result<Success, Error>;

export interface ISignupRegisterUseCase {
	execute(
		signupSession: SignupSession,
		name: string,
		password: string,
		gender: Gender,
	): Promise<SignupRegisterUseCaseResult>;
}
