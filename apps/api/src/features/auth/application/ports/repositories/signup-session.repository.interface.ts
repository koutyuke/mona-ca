import type { SignupSessionId } from "../../../../common/domain/value-objects";
import type { SignupSession } from "../../../../domain/entities";

export type ISignupSessionRepository = {
	findById: (id: SignupSessionId) => Promise<SignupSession | null>;
	save: (signupSession: SignupSession) => Promise<void>;
	deleteById: (id: SignupSessionId) => Promise<void>;
	deleteByEmail: (email: string) => Promise<void>;
};
