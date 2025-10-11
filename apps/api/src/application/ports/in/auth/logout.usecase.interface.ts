import type { SessionId } from "../../../../domain/value-object";

export interface ILogoutUseCase {
	execute(sessionId: SessionId): Promise<void>;
}
