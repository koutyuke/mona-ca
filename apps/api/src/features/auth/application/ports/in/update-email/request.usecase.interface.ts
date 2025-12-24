import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { EmailVerificationRequest } from "../../../../domain/entities/email-verification-request";
import type { UserCredentials } from "../../../../domain/entities/user-credentials";
import type { EmailVerificationRequestToken } from "../../../../domain/value-objects/tokens";

type Success = Ok<{
	emailVerificationRequestToken: EmailVerificationRequestToken;
	emailVerificationRequest: EmailVerificationRequest;
}>;

type Error = Err<"EMAIL_ALREADY_REGISTERED">;

export type UpdateEmailRequestUseCaseResult = Result<Success, Error>;

export interface IUpdateEmailRequestUseCase {
	execute(email: string, userCredentials: UserCredentials): Promise<UpdateEmailRequestUseCaseResult>;
}
