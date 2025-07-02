import type { SessionId } from "../../../domain/value-object";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { ILogoutUseCase } from "./interfaces/logout.usecase.interface";

export class LogoutUseCase implements ILogoutUseCase {
	constructor(private readonly sessionRepository: ISessionRepository) {}

	public async execute(sessionId: SessionId): Promise<void> {
		await this.sessionRepository.delete(sessionId);
	}
}
