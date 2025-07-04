import type { Err, Result } from "../../../../common/utils";
import type { EmailVerificationSession, Session, User } from "../../../../domain/entities";

type Success = {
	sessionToken: string;
	session: Session;
};

type Error = Err<"INVALID_CODE"> | Err<"INVALID_EMAIL">;

export type EmailVerificationConfirmUseCaseResult = Result<Success, Error>;
export interface IEmailVerificationConfirmUseCase {
	execute(
		code: string,
		user: User,
		emailVerificationSession: EmailVerificationSession,
	): Promise<EmailVerificationConfirmUseCaseResult>;
}
