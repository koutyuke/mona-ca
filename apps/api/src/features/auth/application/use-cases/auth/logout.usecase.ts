import type { ILogoutUseCase } from "../../../../../application/ports/in";
import type { SessionId } from "../../../../../common/domain/value-objects";
import type { ISessionRepository } from "../../ports/out/repositories";

export class LogoutUseCase implements ILogoutUseCase {
	constructor(private readonly sessionRepository: ISessionRepository) {}

	public async execute(sessionId: SessionId): Promise<void> {
		await this.sessionRepository.deleteById(sessionId);
	}
}
