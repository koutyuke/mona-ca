import type { User } from "../../../../domain/entities";

export interface IChangeEmailUseCaseResult {
	success: boolean;
}

export interface IChangeEmailUseCase {
	execute(email: string, code: string, user: User): Promise<IChangeEmailUseCaseResult>;
}
