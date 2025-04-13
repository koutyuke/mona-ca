import { passwordResetSessionExpiresSpan } from "../../common/constants/session";
import type { PasswordResetSessionId, UserId } from "../value-object";

export interface PasswordResetSession {
	id: PasswordResetSessionId;
	userId: UserId;
	code: string;
	email: string;
	emailVerified: boolean;
	expiresAt: Date;
}

export const createPasswordResetSession = (args: {
	id: PasswordResetSessionId;
	userId: UserId;
	code: string;
	email: string;
}): PasswordResetSession => {
	return {
		id: args.id,
		userId: args.userId,
		code: args.code,
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
