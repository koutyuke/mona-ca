import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { EmailVerificationSession } from "../../../domain/entities/email-verification-session";
import type { Session } from "../../../domain/entities/session";
import type { UserIdentity } from "../../../domain/entities/user-identity";
import type { SessionToken } from "../../../domain/value-objects/session-token";

type Success = Ok<{
	sessionToken: SessionToken;
	session: Session;
}>;

type Error = Err<"INVALID_VERIFICATION_CODE"> | Err<"EMAIL_ALREADY_REGISTERED">;

export type UpdateEmailUseCaseResult = Result<Success, Error>;

export interface IUpdateEmailUseCase {
	execute(
		code: string,
		userIdentity: UserIdentity,
		emailVerificationSession: EmailVerificationSession,
	): Promise<UpdateEmailUseCaseResult>;
}
