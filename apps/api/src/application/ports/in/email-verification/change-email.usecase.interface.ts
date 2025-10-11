import type { Err, Result } from "../../../../common/utils";
import type { EmailVerificationSession, Session, User } from "../../../../domain/entities";
import type { SessionToken } from "../../../../domain/value-object";

type Success = {
	sessionToken: SessionToken;
	session: Session;
};

type Error = Err<"INVALID_VERIFICATION_CODE"> | Err<"EMAIL_ALREADY_REGISTERED">;

export type ChangeEmailUseCaseResult = Result<Success, Error>;

export interface IChangeEmailUseCase {
	execute(
		code: string,
		user: User,
		emailVerificationSession: EmailVerificationSession,
	): Promise<ChangeEmailUseCaseResult>;
}
