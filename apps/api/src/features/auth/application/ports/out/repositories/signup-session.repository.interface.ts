import type { SignupSession } from "../../../../domain/entities/signup-session";
import type { SignupSessionId } from "../../../../domain/value-objects/ids";

export type ISignupSessionRepository = {
	findById: (id: SignupSessionId) => Promise<SignupSession | null>;
	save: (signupSession: SignupSession) => Promise<void>;
	deleteById: (id: SignupSessionId) => Promise<void>;
	deleteByEmail: (email: string) => Promise<void>;
};
