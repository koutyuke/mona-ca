import type { SessionId } from "../../../../../../common/domain/value-objects";

export interface ILogoutUseCase {
	execute(sessionId: SessionId): Promise<void>;
}
