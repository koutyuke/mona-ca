import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { EmailVerificationSession } from "../../../domain/entities/email-verification-session";
import type { UserIdentity } from "../../../domain/entities/user-identity";

type Success = Ok;

type Error = Err<"INVALID_VERIFICATION_CODE"> | Err<"EMAIL_MISMATCH">;

export type EmailVerificationConfirmUseCaseResult = Result<Success, Error>;
export interface IEmailVerificationConfirmUseCase {
	execute(
		code: string,
		userIdentity: UserIdentity,
		emailVerificationSession: EmailVerificationSession,
	): Promise<EmailVerificationConfirmUseCaseResult>;
}
