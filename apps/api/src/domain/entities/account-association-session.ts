import { accountAssociationSessionExpiresSpan } from "../../common/constants";
import type { OAuthProvider, OAuthProviderId, UserId } from "../value-object";
import type { AccountAssociationSessionId } from "../value-object";

export interface AccountAssociationSession {
	id: AccountAssociationSessionId;
	userId: UserId;
	code: string | null;
	secretHash: Uint8Array;
	email: string;
	provider: OAuthProvider;
	providerId: OAuthProviderId;
	expiresAt: Date;
}

export const createAccountAssociationSession = (args: {
	id: AccountAssociationSessionId;
	userId: UserId;
	code: string | null;
	secretHash: Uint8Array;
	email: string;
	provider: OAuthProvider;
	providerId: OAuthProviderId;
}): AccountAssociationSession => {
	return {
		id: args.id,
		userId: args.userId,
		code: args.code,
		secretHash: args.secretHash,
		email: args.email,
		provider: args.provider,
		providerId: args.providerId,
		expiresAt: new Date(Date.now() + accountAssociationSessionExpiresSpan.milliseconds()),
	};
};

export const isExpiredAccountAssociationSession = (session: AccountAssociationSession): boolean => {
	return session.expiresAt.getTime() < Date.now();
};
