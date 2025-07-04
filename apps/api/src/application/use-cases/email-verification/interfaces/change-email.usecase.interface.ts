import type { Err, Result } from "../../../../common/utils";
import type { EmailVerificationSession, Session, User } from "../../../../domain/entities";

type Success = {
	sessionToken: string;
	session: Session;
};

type Error = Err<"INVALID_CODE"> | Err<"EMAIL_IS_ALREADY_USED">;

export type ChangeEmailUseCaseResult = Result<Success, Error>;

export interface IChangeEmailUseCase {
	execute(
		code: string,
		user: User,
		emailVerificationSession: EmailVerificationSession,
	): Promise<ChangeEmailUseCaseResult>;
}
