import type { SessionId } from "../../../domain/value-objects/ids";
import type { ILogoutUseCase } from "../../contracts/basic-auth/logout.usecase.interface";
import type { ISessionRepository } from "../../ports/repositories/session.repository.interface";

export class LogoutUseCase implements ILogoutUseCase {
	constructor(private readonly sessionRepository: ISessionRepository) {}

	public async execute(sessionId: SessionId): Promise<void> {
		await this.sessionRepository.deleteById(sessionId);
	}
}
