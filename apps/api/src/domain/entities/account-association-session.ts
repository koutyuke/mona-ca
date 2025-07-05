import { accountAssociationSessionExpiresSpan } from "../../common/constants";
import type { OAuthProvider, OAuthProviderId, UserId } from "../value-object";
import type { AccountAssociationSessionId } from "../value-object";

export interface AccountAssociationSession<Code extends string | null = string | null> {
	id: AccountAssociationSessionId;
	userId: UserId;
	code: Code;
	secretHash: Uint8Array;
	email: string;
	provider: OAuthProvider;
	providerId: OAuthProviderId;
	expiresAt: Date;
}

export const createAccountAssociationSession = <Code extends string | null>(args: {
	id: AccountAssociationSessionId;
	userId: UserId;
	code: Code;
	secretHash: Uint8Array;
	email: string;
	provider: OAuthProvider;
	providerId: OAuthProviderId;
}): AccountAssociationSession<Code> => {
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

export const isExpiredAccountAssociationSession = <Code extends string | null>(
	session: AccountAssociationSession<Code>,
): boolean => {
	return session.expiresAt.getTime() < Date.now();
};
