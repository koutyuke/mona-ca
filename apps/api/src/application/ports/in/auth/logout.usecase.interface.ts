import type { SessionId } from "../../../../domain/value-objects";

export interface ILogoutUseCase {
	execute(sessionId: SessionId): Promise<void>;
}
