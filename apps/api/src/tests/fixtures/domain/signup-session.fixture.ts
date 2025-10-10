import { ulid } from "../../../common/utils";
import { type SignupSession, signupSessionEmailVerificationExpiresSpan } from "../../../domain/entities";
import { type SignupSessionToken, formatSessionToken, newSignupSessionId } from "../../../domain/value-object";
import { hashSessionSecret } from "../../../infrastructure/crypt";

export const createSignupSessionFixture = (override?: {
	signupSession?: Partial<SignupSession>;
	signupSessionSecret?: string;
}): {
	signupSession: SignupSession;
	signupSessionSecret: string;
	signupSessionToken: SignupSessionToken;
} => {
	const signupSessionSecret = override?.signupSessionSecret ?? "signupSessionSecret";
	const secretHash = override?.signupSession?.secretHash ?? hashSessionSecret(signupSessionSecret);

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
