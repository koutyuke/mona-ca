import { newUserId } from "../../../../core/domain/value-objects";
import { ulid } from "../../../../core/lib/id";
import { SessionSecretHasherMock } from "../../../../core/testing/mocks/system";
import {
	type PasswordResetSession,
	passwordResetSessionEmailVerificationExpiresSpan,
} from "../../domain/entities/password-reset-session";
import { newPasswordResetSessionId } from "../../domain/value-objects/ids";
import { type PasswordResetSessionToken, formatAnySessionToken } from "../../domain/value-objects/session-token";

const sessionSecretHasher = new SessionSecretHasherMock();

export const createPasswordResetSessionFixture = (override?: {
	secretHasher?: (secret: string) => Uint8Array;
	passwordResetSession?: Partial<PasswordResetSession>;
	passwordResetSessionSecret?: string;
}): {
	passwordResetSession: PasswordResetSession;
	passwordResetSessionSecret: string;
	passwordResetSessionToken: PasswordResetSessionToken;
} => {
	const secretHasher = override?.secretHasher ?? sessionSecretHasher.hash;

	const passwordResetSessionSecret = override?.passwordResetSessionSecret ?? "passwordResetSessionSecret";
	const secretHash = secretHasher(passwordResetSessionSecret);

	const expiresAt = new Date(
		override?.passwordResetSession?.expiresAt?.getTime() ??
			Date.now() + passwordResetSessionEmailVerificationExpiresSpan.milliseconds(),
	);
	expiresAt.setMilliseconds(0);

	const passwordResetSession: PasswordResetSession = {
		id: newPasswordResetSessionId(ulid()),
		userId: newUserId(ulid()),
		code: "testCode",
		secretHash,
		email: "test.email@example.com",
		emailVerified: true,
		expiresAt,
		...override?.passwordResetSession,
	};

	return {
		passwordResetSession,
		passwordResetSessionSecret: passwordResetSessionSecret,
		passwordResetSessionToken: formatAnySessionToken(passwordResetSession.id, passwordResetSessionSecret),
	};
};
