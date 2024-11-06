import type { ISessionRepository } from "@/interface-adapter/repositories/session";
import type { ISessionTokenService } from "@/services/session-token";
import type { ILogoutUseCase } from "./interface/logout.usecase.interface";

export class LogoutUseCase implements ILogoutUseCase {
	constructor(
		private readonly sessionRepository: ISessionRepository,
		private readonly sessionTokenService: ISessionTokenService,
	) {}

	public async execute(sessionToken: string): Promise<void> {
		const sessionId = this.sessionTokenService.hashSessionToken(sessionToken);
		await this.sessionRepository.delete(sessionId);
	}
}