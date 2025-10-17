import { TimeSpan } from "../../common/utils";
import type { SignupSessionId } from "../value-objects";

export const SIGNUP_SESSION_EMAIL_VERIFICATION_EXPIRES_SPAN_MINUTES = 10 as const;
export const SIGNUP_SESSION_SIGNUP_EXPIRES_SPAN_MINUTES = 30 as const;

export const signupSessionEmailVerificationExpiresSpan = new TimeSpan(
	SIGNUP_SESSION_EMAIL_VERIFICATION_EXPIRES_SPAN_MINUTES,
	"m",
);
export const signupSessionSignupExpiresSpan = new TimeSpan(SIGNUP_SESSION_SIGNUP_EXPIRES_SPAN_MINUTES, "m");

export interface SignupSession {
	id: SignupSessionId;
	email: string;
	emailVerified: boolean;
	code: string;
	secretHash: Uint8Array;
	expiresAt: Date;
}

export const createSignupSession = (args: {
	id: SignupSessionId;
	email: string;
	code: string;
	secretHash: Uint8Array;
}): SignupSession => {
	return {
		id: args.id,
		email: args.email,
		emailVerified: false,
		code: args.code,
		secretHash: args.secretHash,
		expiresAt: new Date(Date.now() + signupSessionEmailVerificationExpiresSpan.milliseconds()),
	};
};

export const completeEmailVerificationForSignupSession = (session: SignupSession): SignupSession => {
	return {
		...session,
		emailVerified: true,
		expiresAt: new Date(Date.now() + signupSessionSignupExpiresSpan.milliseconds()),
	};
};

export const isExpiredSignupSession = (session: SignupSession): boolean => {
	return session.expiresAt.getTime() < Date.now();
};
