import type { User } from "@/domain/user";

export interface IChangeEmailUseCaseResult {
	success: boolean;
}

export interface IChangeEmailUseCase {
	execute(email: string, code: string, user: User): Promise<IChangeEmailUseCaseResult>;
}
