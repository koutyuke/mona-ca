import { emailVerificationSessionExpiresSpan } from "../../common/constants";
import type { EmailVerificationSessionId, UserId } from "../value-object";

export interface EmailVerificationSession {
	id: EmailVerificationSessionId;
	email: string;
	userId: UserId;
	code: string;
	expiresAt: Date;
}

export const createEmailVerificationSession = (args: {
	id: EmailVerificationSessionId;
	email: string;
	userId: UserId;
	code: string;
}): EmailVerificationSession => {
	return {
		id: args.id,
		email: args.email,
		userId: args.userId,
		code: args.code,
		expiresAt: new Date(Date.now() + emailVerificationSessionExpiresSpan.milliseconds()),
	};
};

export const isExpiredEmailVerificationSession = (session: EmailVerificationSession): boolean => {
	return session.expiresAt.getTime() < Date.now();
};
