import type { SignupSession } from "../../../../domain/entities";
import type { SignupSessionId } from "../../../../domain/value-object";

export type ISignupSessionRepository = {
	findById: (id: SignupSessionId) => Promise<SignupSession | null>;
	save: (signupSession: SignupSession) => Promise<void>;
	deleteById: (id: SignupSessionId) => Promise<void>;
	deleteByEmail: (email: string) => Promise<void>;
};
