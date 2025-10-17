import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { SessionToken } from "../../../../../../common/domain/value-objects";
import type { EmailVerificationSession, Session, User } from "../../../../domain/entities";

type Success = Ok<{
	sessionToken: SessionToken;
	session: Session;
}>;

type Error = Err<"INVALID_VERIFICATION_CODE"> | Err<"EMAIL_MISMATCH">;

export type EmailVerificationConfirmUseCaseResult = Result<Success, Error>;
export interface IEmailVerificationConfirmUseCase {
	execute(
		code: string,
		user: User,
		emailVerificationSession: EmailVerificationSession,
	): Promise<EmailVerificationConfirmUseCaseResult>;
}
