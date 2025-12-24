import type { UserId } from "../../../../core/domain/value-objects";
import { TimeSpan } from "../../../../core/lib/time";
import type { IdentityProviders, IdentityProvidersUserId } from "../value-objects/identity-providers";
import type { AccountLinkRequestId } from "../value-objects/ids";

export const ACCOUNT_LINK_REQUEST_EXPIRES_SPAN_MINUTES = 10 as const;

export const accountLinkRequestExpiresSpan = new TimeSpan(ACCOUNT_LINK_REQUEST_EXPIRES_SPAN_MINUTES, "m");

export interface AccountLinkRequest {
	id: AccountLinkRequestId;
	userId: UserId;
	code: string | null;
	secretHash: Uint8Array;
	email: string;
	provider: IdentityProviders;
	providerUserId: IdentityProvidersUserId;
	expiresAt: Date;
}

export const createAccountLinkRequest = (args: {
	id: AccountLinkRequestId;
	userId: UserId;
	code: string | null;
	secretHash: Uint8Array;
	email: string;
	provider: IdentityProviders;
	providerUserId: IdentityProvidersUserId;
}): AccountLinkRequest => {
	return {
		id: args.id,
		userId: args.userId,
		code: args.code,
		secretHash: args.secretHash,
		email: args.email,
		provider: args.provider,
		providerUserId: args.providerUserId,
		expiresAt: new Date(Date.now() + accountLinkRequestExpiresSpan.milliseconds()),
	};
};

export const isExpiredAccountLinkRequest = (request: AccountLinkRequest): boolean => {
	return request.expiresAt.getTime() < Date.now();
};
