import type { ISignupSessionRepository } from "../../../application/ports/out/repositories";
import type { SignupSession } from "../../../domain/entities";
import type { SignupSessionId } from "../../../domain/value-objects";

export class SignupSessionRepositoryMock implements ISignupSessionRepository {
	private readonly signupSessionMap: Map<SignupSessionId, SignupSession>;

	constructor(maps: {
		signupSessionMap: Map<SignupSessionId, SignupSession>;
	}) {
		this.signupSessionMap = maps.signupSessionMap;
	}

	async findById(id: SignupSessionId): Promise<SignupSession | null> {
		return this.signupSessionMap.get(id) || null;
	}

	async save(signupSession: SignupSession): Promise<void> {
		this.signupSessionMap.set(signupSession.id, signupSession);
	}

	async deleteById(id: SignupSessionId): Promise<void> {
		this.signupSessionMap.delete(id);
	}

	async deleteByEmail(email: string): Promise<void> {
		for (const [sessionId, session] of this.signupSessionMap.entries()) {
			if (session.email === email) {
				this.signupSessionMap.delete(sessionId);
			}
		}
	}
}
