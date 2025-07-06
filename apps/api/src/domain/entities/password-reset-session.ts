import { TimeSpan } from "../../common/utils";
import type { PasswordResetSessionId, UserId } from "../value-object";

export const PASSWORD_RESET_SESSION_EXPIRES_SPAN_MINUTES = 10 as const;

export const passwordResetSessionExpiresSpan = new TimeSpan(PASSWORD_RESET_SESSION_EXPIRES_SPAN_MINUTES, "m");

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
		expiresAt: new Date(Date.now() + passwordResetSessionExpiresSpan.milliseconds()),
	};
};

export const updatePasswordResetSession = (
	session: PasswordResetSession,
	args: {
		emailVerified?: boolean;
	},
): PasswordResetSession => {
	return {
		...session,
		...args,
	};
};

export const isExpiredPasswordResetSession = (session: PasswordResetSession): boolean => {
	return session.expiresAt.getTime() < Date.now();
};
