import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { EmailVerificationSession } from "../../../domain/entities/email-verification-session";
import type { Session } from "../../../domain/entities/session";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { SessionToken } from "../../../domain/value-objects/tokens";

type Success = Ok<{
	sessionToken: SessionToken;
	session: Session;
}>;

type Error = Err<"INVALID_VERIFICATION_CODE"> | Err<"EMAIL_ALREADY_REGISTERED">;

export type UpdateEmailCompleteUseCaseResult = Result<Success, Error>;

export interface IUpdateEmailCompleteUseCase {
	execute(
		code: string,
		userCredentials: UserCredentials,
		emailVerificationSession: EmailVerificationSession,
	): Promise<UpdateEmailCompleteUseCaseResult>;
}
