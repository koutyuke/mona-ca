import type { User } from "../../../../domain/user";

export interface IEmailVerificationConfirmUseCaseResult {
	success: boolean;
}

export interface IEmailVerificationConfirmUseCase {
	execute(code: string, user: User): Promise<IEmailVerificationConfirmUseCaseResult>;
}
