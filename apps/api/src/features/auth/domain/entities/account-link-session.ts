import type { UserId } from "../../../../core/domain/value-objects";
import { TimeSpan } from "../../../../core/lib/time";
import type { AccountLinkSessionId } from "../value-objects/ids";

export const ACCOUNT_LINK_SESSION_EXPIRES_SPAN_MINUTES = 10 as const;

export const accountLinkSessionExpiresSpan = new TimeSpan(ACCOUNT_LINK_SESSION_EXPIRES_SPAN_MINUTES, "m");

export interface AccountLinkSession {
	id: AccountLinkSessionId;
	userId: UserId;
	secretHash: Uint8Array;
	expiresAt: Date;
}

export const createAccountLinkSession = (args: {
	id: AccountLinkSessionId;
	userId: UserId;
	secretHash: Uint8Array;
}): AccountLinkSession => {
	return {
		id: args.id,
		userId: args.userId,
		secretHash: args.secretHash,
		expiresAt: new Date(Date.now() + accountLinkSessionExpiresSpan.milliseconds()),
	};
};

export const isExpiredAccountLinkSession = (session: AccountLinkSession): boolean => {
	return session.expiresAt.getTime() < Date.now();
};
