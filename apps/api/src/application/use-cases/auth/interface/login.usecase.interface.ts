import type { Session } from "../../../../entities/session";

export interface ILoginUseCaseResult {
	session: Session;
	sessionToken: string;
}

export interface ILoginUseCase {
	execute(email: string, password: string): Promise<ILoginUseCaseResult>;
}
