import { type SignupSessionToken, formatSessionToken, newSignupSessionId } from "../../../common/domain/value-objects";
import { type SignupSession, signupSessionEmailVerificationExpiresSpan } from "../../../domain/entities";
import { ulid } from "../../../lib/utils";
import { SessionSecretHasherMock } from "../../mocks";

const sessionSecretHasher = new SessionSecretHasherMock();

export const createSignupSessionFixture = (override?: {
	secretHasher?: (secret: string) => Uint8Array;
	signupSession?: Partial<SignupSession>;
	signupSessionSecret?: string;
}): {
	signupSession: SignupSession;
	signupSessionSecret: string;
	signupSessionToken: SignupSessionToken;
} => {
	const secretHasher = override?.secretHasher ?? sessionSecretHasher.hash;

	const signupSessionSecret = override?.signupSessionSecret ?? "signupSessionSecret";
	const secretHash = override?.signupSession?.secretHash ?? secretHasher(signupSessionSecret);

	const expiresAt = new Date(
		override?.signupSession?.expiresAt?.getTime() ??
			Date.now() + signupSessionEmailVerificationExpiresSpan.milliseconds(),
	);
	expiresAt.setMilliseconds(0);

	const signupSession: SignupSession = {
		id: override?.signupSession?.id ?? newSignupSessionId(ulid()),
		email: override?.signupSession?.email ?? "test@example.com",
		emailVerified: override?.signupSession?.emailVerified ?? false,
		code: override?.signupSession?.code ?? "testCode",
		secretHash: override?.signupSession?.secretHash ?? secretHash,
		expiresAt,
	};

	return {
		signupSession,
		signupSessionSecret,
		signupSessionToken: formatSessionToken(signupSession.id, signupSessionSecret),
	};
};
