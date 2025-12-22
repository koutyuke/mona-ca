import type { Brand } from "@mona-ca/core/types";
import type {
	AccountLinkRequestId,
	EmailVerificationRequestId,
	PasswordResetSessionId,
	ProviderLinkRequestId,
	SessionId,
	SignupSessionId,
} from "./ids";

export type AccountLinkRequestToken = Brand<"AccountLinkRequestToken", string>;
export type EmailVerificationRequestToken = Brand<"EmailVerificationRequestToken", string>;
export type PasswordResetSessionToken = Brand<"PasswordResetSessionToken", string>;
export type ProviderLinkRequestToken = Brand<"ProviderLinkRequestToken", string>;
export type SessionToken = Brand<"SessionToken", string>;
export type SignupSessionToken = Brand<"SignupSessionToken", string>;

export const newSessionToken = (rawSessionToken: string) => {
	return rawSessionToken as SessionToken;
};
export const newEmailVerificationRequestToken = (rawEmailVerificationRequestToken: string) => {
	return rawEmailVerificationRequestToken as EmailVerificationRequestToken;
};
export const newPasswordResetSessionToken = (rawPasswordResetSessionToken: string) => {
	return rawPasswordResetSessionToken as PasswordResetSessionToken;
};
export const newAccountLinkRequestToken = (rawAccountLinkRequestToken: string) => {
	return rawAccountLinkRequestToken as AccountLinkRequestToken;
};
export const newSignupSessionToken = (rawSignupSessionToken: string) => {
	return rawSignupSessionToken as SignupSessionToken;
};
export const newProviderLinkRequestToken = (rawProviderLinkRequestToken: string) => {
	return rawProviderLinkRequestToken as ProviderLinkRequestToken;
};

type AnyEntityId =
	| EmailVerificationRequestId
	| PasswordResetSessionId
	| AccountLinkRequestId
	| ProviderLinkRequestId
	| SessionId
	| SignupSessionId;

export type AnyToken =
	| EmailVerificationRequestToken
	| PasswordResetSessionToken
	| AccountLinkRequestToken
	| ProviderLinkRequestToken
	| SessionToken
	| SignupSessionToken;

type TokenAndIdMap =
	| [EmailVerificationRequestToken, EmailVerificationRequestId]
	| [PasswordResetSessionToken, PasswordResetSessionId]
	| [AccountLinkRequestToken, AccountLinkRequestId]
	| [ProviderLinkRequestToken, ProviderLinkRequestId]
	| [SessionToken, SessionId]
	| [SignupSessionToken, SignupSessionId];

type TokenToId<T extends AnyToken> = Extract<TokenAndIdMap, [T, unknown]>[1];
type IdToToken<T extends AnyEntityId> = Extract<TokenAndIdMap, [unknown, T]>[0];

export const decodeToken = <T extends AnyToken>(token: T): { id: TokenToId<T>; secret: string } | null => {
	const dot = token.indexOf(".");
	if (dot <= 0 || dot === token.length - 1) return null;
	const id = token.slice(0, dot) as TokenToId<T>;
	const secret = token.slice(dot + 1);
	return { id, secret };
};

export const encodeToken = <T extends AnyEntityId>(id: T, secret: string): IdToToken<T> => {
	return `${id}.${secret}` as IdToToken<typeof id>;
};
