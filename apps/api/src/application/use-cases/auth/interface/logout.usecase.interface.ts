export interface ILogoutUseCase {
	execute(sessionToken: string): Promise<void>;
}
