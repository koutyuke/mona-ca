import type { NewType } from "@mona-ca/core/utils";
import type {
	AccountAssociationSessionId,
	EmailVerificationSessionId,
	PasswordResetSessionId,
	SessionId,
	SignupSessionId,
} from "./ids";

export type SessionToken = NewType<"SessionToken", string>;
export type EmailVerificationSessionToken = NewType<"EmailVerificationSessionToken", string>;
export type PasswordResetSessionToken = NewType<"PasswordResetSessionToken", string>;
export type AccountAssociationSessionToken = NewType<"AccountAssociationSessionToken", string>;
export type SignupSessionToken = NewType<"SignupSessionToken", string>;

export const newSessionToken = (rawSessionToken: string) => {
	return rawSessionToken as SessionToken;
};
export const newEmailVerificationSessionToken = (rawEmailVerificationSessionToken: string) => {
	return rawEmailVerificationSessionToken as EmailVerificationSessionToken;
};
export const newPasswordResetSessionToken = (rawPasswordResetSessionToken: string) => {
	return rawPasswordResetSessionToken as PasswordResetSessionToken;
};
export const newAccountAssociationSessionToken = (rawAccountAssociationSessionToken: string) => {
	return rawAccountAssociationSessionToken as AccountAssociationSessionToken;
};
export const newSignupSessionToken = (rawSignupSessionToken: string) => {
	return rawSignupSessionToken as SignupSessionToken;
};

type AnySessionId =
	| SessionId
	| EmailVerificationSessionId
	| PasswordResetSessionId
	| AccountAssociationSessionId
	| SignupSessionId;

type AnySessionToken =
	| SessionToken
	| EmailVerificationSessionToken
	| PasswordResetSessionToken
	| AccountAssociationSessionToken
	| SignupSessionToken;

type SessionTokenAndIdMap =
	| [SessionToken, SessionId]
	| [EmailVerificationSessionToken, EmailVerificationSessionId]
	| [PasswordResetSessionToken, PasswordResetSessionId]
	| [AccountAssociationSessionToken, AccountAssociationSessionId]
	| [SignupSessionToken, SignupSessionId];

type TokenToId<T extends AnySessionToken> = Extract<SessionTokenAndIdMap, [T, unknown]>[1];
type IdToToken<T extends AnySessionId> = Extract<SessionTokenAndIdMap, [unknown, T]>[0];

export const parseAnySessionToken = <T extends AnySessionToken>(
	token: T,
): { id: TokenToId<T>; secret: string } | null => {
	const dot = token.indexOf(".");
	if (dot <= 0 || dot === token.length - 1) return null;
	const id = token.slice(0, dot) as TokenToId<T>;
	const secret = token.slice(dot + 1);
	return { id, secret };
};

export const formatAnySessionToken = <T extends AnySessionId>(id: T, secret: string): IdToToken<T> => {
	return `${id}.${secret}` as IdToToken<typeof id>;
};
