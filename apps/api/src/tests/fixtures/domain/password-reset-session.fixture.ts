import { ulid } from "../../../common/utils";
import { type PasswordResetSession, passwordResetSessionExpiresSpan } from "../../../domain/entities";
import {
	type PasswordResetSessionToken,
	formatSessionToken,
	newPasswordResetSessionId,
	newUserId,
} from "../../../domain/value-object";

export const createPasswordResetSessionFixture = (
	hasher: (secret: string) => Uint8Array,
	override?: {
		passwordResetSession?: Partial<PasswordResetSession>;
		passwordResetSessionSecret?: string;
	},
): {
	passwordResetSession: PasswordResetSession;
	passwordResetSessionSecret: string;
	passwordResetSessionToken: PasswordResetSessionToken;
} => {
	const passwordResetSessionSecret = override?.passwordResetSessionSecret ?? "passwordResetSessionSecret";
	const secretHash = override?.passwordResetSession?.secretHash ?? hasher(passwordResetSessionSecret);

	const expiresAt = new Date(
		override?.passwordResetSession?.expiresAt?.getTime() ?? Date.now() + passwordResetSessionExpiresSpan.milliseconds(),
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
		passwordResetSessionToken: formatSessionToken(passwordResetSession.id, passwordResetSessionSecret),
	};
};
