import { TimeSpan } from "../../common/utils";
import type { EmailVerificationSessionId, UserId } from "../value-objects";

export const EMAIL_VERIFICATION_SESSION_EXPIRES_SPAN_MINUTES = 10 as const;

export const emailVerificationSessionExpiresSpan = new TimeSpan(EMAIL_VERIFICATION_SESSION_EXPIRES_SPAN_MINUTES, "m");

export interface EmailVerificationSession {
	id: EmailVerificationSessionId;
	email: string;
	userId: UserId;
	code: string;
	secretHash: Uint8Array;
	expiresAt: Date;
}

export const createEmailVerificationSession = (args: {
	id: EmailVerificationSessionId;
	email: string;
	userId: UserId;
	code: string;
	secretHash: Uint8Array;
}): EmailVerificationSession => {
	return {
		id: args.id,
		email: args.email,
		userId: args.userId,
		code: args.code,
		secretHash: args.secretHash,
		expiresAt: new Date(Date.now() + emailVerificationSessionExpiresSpan.milliseconds()),
	};
};

export const isExpiredEmailVerificationSession = (session: EmailVerificationSession): boolean => {
	return session.expiresAt.getTime() < Date.now();
};
