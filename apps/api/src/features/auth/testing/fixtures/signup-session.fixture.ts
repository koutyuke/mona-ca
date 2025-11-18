import { ulid } from "../../../../core/lib/id";
import { TokenSecretServiceMock } from "../../../../core/testing/mocks/system";
import { type SignupSession, signupSessionEmailVerificationExpiresSpan } from "../../domain/entities/signup-session";
import { newSignupSessionId } from "../../domain/value-objects/ids";
import { type SignupSessionToken, encodeToken } from "../../domain/value-objects/tokens";

const tokenSecretService = new TokenSecretServiceMock();

export const createSignupSessionFixture = (override?: {
	secretHasher?: (secret: string) => Uint8Array;
	signupSession?: Partial<SignupSession>;
	signupSessionSecret?: string;
}): {
	signupSession: SignupSession;
	signupSessionSecret: string;
	signupSessionToken: SignupSessionToken;
} => {
	const secretHasher = override?.secretHasher ?? tokenSecretService.hash;

	const signupSessionSecret = override?.signupSessionSecret ?? "signupSessionSecret";
	const secretHash = secretHasher(signupSessionSecret);

	const expiresAt = new Date(
		override?.signupSession?.expiresAt?.getTime() ??
			Date.now() + signupSessionEmailVerificationExpiresSpan.milliseconds(),
	);
	expiresAt.setMilliseconds(0);

	const signupSession: SignupSession = {
		id: newSignupSessionId(ulid()),
		email: "test@example.com",
		emailVerified: false,
		code: "testCode",
		secretHash: secretHash,
		expiresAt,
		...override?.signupSession,
	};

	return {
		signupSession,
		signupSessionSecret,
		signupSessionToken: encodeToken(signupSession.id, signupSessionSecret),
	};
};
