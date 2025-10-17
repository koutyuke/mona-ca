import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { SessionToken } from "../../../../../../common/domain/value-objects";
import type { EmailVerificationSession, Session, User } from "../../../../domain/entities";

type Success = Ok<{
	sessionToken: SessionToken;
	session: Session;
}>;

type Error = Err<"INVALID_VERIFICATION_CODE"> | Err<"EMAIL_ALREADY_REGISTERED">;

export type UpdateEmailUseCaseResult = Result<Success, Error>;

export interface IUpdateEmailUseCase {
	execute(
		code: string,
		user: User,
		emailVerificationSession: EmailVerificationSession,
	): Promise<UpdateEmailUseCaseResult>;
}
