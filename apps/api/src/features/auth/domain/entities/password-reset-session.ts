import type { UserId } from "../../../../shared/domain/value-objects";
import { TimeSpan } from "../../../../shared/lib/utils";
import type { PasswordResetSessionId } from "../value-objects/ids";

export const PASSWORD_RESET_SESSION_EMAIL_VERIFICATION_EXPIRES_SPAN_MINUTES = 10 as const;
export const PASSWORD_RESET_SESSION_RESET_EXPIRES_SPAN_MINUTES = 10 as const;

export const passwordResetSessionEmailVerificationExpiresSpan = new TimeSpan(
	PASSWORD_RESET_SESSION_EMAIL_VERIFICATION_EXPIRES_SPAN_MINUTES,
	"m",
);
export const passwordResetSessionResetExpiresSpan = new TimeSpan(
	PASSWORD_RESET_SESSION_RESET_EXPIRES_SPAN_MINUTES,
	"m",
);

export interface PasswordResetSession {
	id: PasswordResetSessionId;
	userId: UserId;
	code: string;
	secretHash: Uint8Array;
	email: string;
	emailVerified: boolean;
	expiresAt: Date;
}

export const createPasswordResetSession = (args: {
	id: PasswordResetSessionId;
	userId: UserId;
	code: string;
	secretHash: Uint8Array;
	email: string;
}): PasswordResetSession => {
	return {
		id: args.id,
		userId: args.userId,
		code: args.code,
		secretHash: args.secretHash,
		email: args.email,
		emailVerified: false,
		expiresAt: new Date(Date.now() + passwordResetSessionEmailVerificationExpiresSpan.milliseconds()),
	};
};

export const completeEmailVerificationForPasswordResetSession = (
	session: PasswordResetSession,
): PasswordResetSession => {
	return {
		...session,
		emailVerified: true,
		expiresAt: new Date(Date.now() + passwordResetSessionResetExpiresSpan.milliseconds()),
	};
};

export const isExpiredPasswordResetSession = (session: PasswordResetSession): boolean => {
	return session.expiresAt.getTime() < Date.now();
};
