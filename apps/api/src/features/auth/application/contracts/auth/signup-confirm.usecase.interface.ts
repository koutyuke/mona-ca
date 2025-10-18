import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { Gender } from "../../../../../common/domain/value-objects";
import type { Session } from "../../../domain/entities/session";
import type { SignupSession } from "../../../domain/entities/signup-session";
import type { SessionToken } from "../../../domain/value-objects/session-token";

type Success = Ok<{
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
