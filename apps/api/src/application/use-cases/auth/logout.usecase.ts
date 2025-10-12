import type { SessionId } from "../../../domain/value-object";
import type { ILogoutUseCase } from "../../ports/in";
import type { ISessionRepository } from "../../ports/out/repositories";

export class LogoutUseCase implements ILogoutUseCase {
	constructor(private readonly sessionRepository: ISessionRepository) {}

	public async execute(sessionId: SessionId): Promise<void> {
		await this.sessionRepository.deleteById(sessionId);
	}
}
