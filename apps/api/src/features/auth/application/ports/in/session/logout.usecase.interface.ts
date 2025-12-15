import type { SessionId } from "../../../../domain/value-objects/ids";

export interface ILogoutUseCase {
	execute(sessionId: SessionId): Promise<void>;
}
