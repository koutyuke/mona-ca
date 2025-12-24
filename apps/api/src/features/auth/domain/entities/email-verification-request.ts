import type { UserId } from "../../../../core/domain/value-objects";
import { TimeSpan } from "../../../../core/lib/time";
import type { EmailVerificationRequestId } from "../value-objects/ids";

export const EMAIL_VERIFICATION_REQUEST_EXPIRES_SPAN_MINUTES = 10 as const;

export const emailVerificationRequestExpiresSpan = new TimeSpan(EMAIL_VERIFICATION_REQUEST_EXPIRES_SPAN_MINUTES, "m");

export interface EmailVerificationRequest {
	id: EmailVerificationRequestId;
	email: string;
	userId: UserId;
	code: string;
	secretHash: Uint8Array;
	expiresAt: Date;
}

export const createEmailVerificationRequest = (args: {
	id: EmailVerificationRequestId;
	email: string;
	userId: UserId;
	code: string;
	secretHash: Uint8Array;
}): EmailVerificationRequest => {
	return {
		id: args.id,
		email: args.email,
		userId: args.userId,
		code: args.code,
		secretHash: args.secretHash,
		expiresAt: new Date(Date.now() + emailVerificationRequestExpiresSpan.milliseconds()),
	};
};

export const isExpiredEmailVerificationRequest = (request: EmailVerificationRequest): boolean => {
	return request.expiresAt.getTime() < Date.now();
};
