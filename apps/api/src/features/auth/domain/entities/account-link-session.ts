import type { UserId } from "../../../../core/domain/value-objects";
import { TimeSpan } from "../../../../core/lib/time";
import type { IdentityProviders, IdentityProvidersUserId } from "../value-objects/identity-providers";
import type { AccountLinkSessionId } from "../value-objects/ids";

export const ACCOUNT_LINK_SESSION_EXPIRES_SPAN_MINUTES = 10 as const;

export const accountLinkSessionExpiresSpan = new TimeSpan(ACCOUNT_LINK_SESSION_EXPIRES_SPAN_MINUTES, "m");

export interface AccountLinkSession {
	id: AccountLinkSessionId;
	userId: UserId;
	code: string | null;
	secretHash: Uint8Array;
	email: string;
	provider: IdentityProviders;
	providerUserId: IdentityProvidersUserId;
	expiresAt: Date;
}

export const createAccountLinkSession = (args: {
	id: AccountLinkSessionId;
	userId: UserId;
	code: string | null;
	secretHash: Uint8Array;
	email: string;
	provider: IdentityProviders;
	providerUserId: IdentityProvidersUserId;
}): AccountLinkSession => {
	return {
		id: args.id,
		userId: args.userId,
		code: args.code,
		secretHash: args.secretHash,
		email: args.email,
		provider: args.provider,
		providerUserId: args.providerUserId,
		expiresAt: new Date(Date.now() + accountLinkSessionExpiresSpan.milliseconds()),
	};
};

export const isExpiredAccountLinkSession = (session: AccountLinkSession): boolean => {
	return session.expiresAt.getTime() < Date.now();
};
