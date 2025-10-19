import { newUserId } from "../../../../shared/domain/value-objects";
import { ulid } from "../../../../shared/lib/id";
import { SessionSecretHasherMock } from "../../../../shared/testing/mocks/system";
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
	const secretHash = override?.passwordResetSession?.secretHash ?? secretHasher(passwordResetSessionSecret);

	const expiresAt = new Date(
		override?.passwordResetSession?.expiresAt?.getTime() ??
			Date.now() + passwordResetSessionEmailVerificationExpiresSpan.milliseconds(),
	);
	expiresAt.setMilliseconds(0);

	const passwordResetSession: PasswordResetSession = {
		id: override?.passwordResetSession?.id ?? newPasswordResetSessionId(ulid()),
		userId: override?.passwordResetSession?.userId ?? newUserId(ulid()),
		code: override?.passwordResetSession?.code ?? "testCode",
		secretHash,
		email: override?.passwordResetSession?.email ?? "test.email@example.com",
		emailVerified: override?.passwordResetSession?.emailVerified ?? true,
		expiresAt,
	};

	return {
		passwordResetSession,
		passwordResetSessionSecret: passwordResetSessionSecret,
		passwordResetSessionToken: formatAnySessionToken(passwordResetSession.id, passwordResetSessionSecret),
	};
};
