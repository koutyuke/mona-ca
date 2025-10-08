import type { Err, Result } from "../../../../common/utils";
import type { Session, SignupSession, User } from "../../../../domain/entities";
import type { Gender } from "../../../../domain/value-object";

type Success = {
	user: User;
	session: Session;
	sessionToken: string;
};

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
