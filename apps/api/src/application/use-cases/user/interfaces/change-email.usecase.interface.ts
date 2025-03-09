import type { User } from "../../../../domain/entities";

export type ChangeEmailUseCaseResult = {
	success: boolean;
};

export interface IChangeEmailUseCase {
	execute(email: string, code: string, user: User): Promise<ChangeEmailUseCaseResult>;
}
