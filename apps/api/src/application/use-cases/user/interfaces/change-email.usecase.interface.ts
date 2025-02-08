import type { User } from "../../../../models/entities/user";

export interface IChangeEmailUseCaseResult {
	success: boolean;
}

export interface IChangeEmailUseCase {
	execute(email: string, code: string, user: User): Promise<IChangeEmailUseCaseResult>;
}
