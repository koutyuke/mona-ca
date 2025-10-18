import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { Gender, SessionToken } from "../../../../../../common/domain/value-objects";
import type { Session, SignupSession, User } from "../../../../domain/entities";

type Success = Ok<{
	user: User;
	session: Session;
	sessionToken: SessionToken;
}>;

type Error = Err<"EMAIL_ALREADY_REGISTERED"> | Err<"EMAIL_VERIFICATION_REQUIRED">;

export type SignupConfirmUseCaseResult = Result<Success, Error>;

export interface ISignupConfirmUseCase {
	execute(
		signupSession: SignupSession,
		name: string,
		password: string,
		gender: Gender,
	): Promise<SignupConfirmUseCaseResult>;
}
