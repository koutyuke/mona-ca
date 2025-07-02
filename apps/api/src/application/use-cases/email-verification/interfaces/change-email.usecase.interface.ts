import type { Err, Result } from "../../../../common/utils";
import type { EmailVerificationSession, Session, User } from "../../../../domain/entities";

type ChangeEmailUseCaseSuccessResult = {
	session: Session;
	sessionToken: string;
};

export type ChangeEmailUseCaseErrorResult = Err<"INVALID_CODE"> | Err<"EXPIRED_CODE"> | Err<"EMAIL_IS_ALREADY_USED">;

export type ChangeEmailUseCaseResult = Result<ChangeEmailUseCaseSuccessResult, ChangeEmailUseCaseErrorResult>;

export interface IChangeEmailUseCase {
	execute(
		code: string,
		user: User,
		emailVerificationSession: EmailVerificationSession,
	): Promise<ChangeEmailUseCaseResult>;
}
