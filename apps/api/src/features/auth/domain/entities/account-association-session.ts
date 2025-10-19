import type { UserId } from "../../../../shared/domain/value-objects";
import { TimeSpan } from "../../../../shared/lib/time";
import type { ExternalIdentityProvider, ExternalIdentityProviderUserId } from "../value-objects/external-identity";
import type { AccountAssociationSessionId } from "../value-objects/ids";

export const ACCOUNT_ASSOCIATION_SESSION_EXPIRES_SPAN_MINUTES = 10 as const;

export const accountAssociationSessionExpiresSpan = new TimeSpan(ACCOUNT_ASSOCIATION_SESSION_EXPIRES_SPAN_MINUTES, "m");

export interface AccountAssociationSession {
	id: AccountAssociationSessionId;
	userId: UserId;
	code: string | null;
	secretHash: Uint8Array;
	email: string;
	provider: ExternalIdentityProvider;
	providerUserId: ExternalIdentityProviderUserId;
	expiresAt: Date;
}

export const createAccountAssociationSession = (args: {
	id: AccountAssociationSessionId;
	userId: UserId;
	code: string | null;
	secretHash: Uint8Array;
	email: string;
	provider: ExternalIdentityProvider;
	providerUserId: ExternalIdentityProviderUserId;
}): AccountAssociationSession => {
	return {
		id: args.id,
		userId: args.userId,
		code: args.code,
		secretHash: args.secretHash,
		email: args.email,
		provider: args.provider,
		providerUserId: args.providerUserId,
		expiresAt: new Date(Date.now() + accountAssociationSessionExpiresSpan.milliseconds()),
	};
};

export const isExpiredAccountAssociationSession = (session: AccountAssociationSession): boolean => {
	return session.expiresAt.getTime() < Date.now();
};
