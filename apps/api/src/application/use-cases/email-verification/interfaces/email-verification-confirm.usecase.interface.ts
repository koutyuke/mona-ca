import type { Err, Result } from "../../../../common/utils";
import type { User } from "../../../../domain/entities/user";

export type EmailVerificationConfirmUseCaseErrorResult = Err<"INVALID_CODE">;

export type EmailVerificationConfirmUseCaseResult = Result<void, EmailVerificationConfirmUseCaseErrorResult>;
export interface IEmailVerificationConfirmUseCase {
	execute(code: string, user: User): Promise<EmailVerificationConfirmUseCaseResult>;
}
