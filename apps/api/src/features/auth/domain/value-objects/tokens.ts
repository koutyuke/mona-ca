import type { NewType } from "@mona-ca/core/utils";
import type {
	AccountLinkSessionId,
	EmailVerificationSessionId,
	PasswordResetSessionId,
	ProviderConnectionTicketId,
	SessionId,
	SignupSessionId,
} from "./ids";

export type AccountLinkSessionToken = NewType<"AccountLinkSessionToken", string>;
export type EmailVerificationSessionToken = NewType<"EmailVerificationSessionToken", string>;
export type PasswordResetSessionToken = NewType<"PasswordResetSessionToken", string>;
export type ProviderConnectionTicketToken = NewType<"ProviderConnectionTicketToken", string>;
export type SessionToken = NewType<"SessionToken", string>;
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
export const newAccountLinkSessionToken = (rawAccountLinkSessionToken: string) => {
	return rawAccountLinkSessionToken as AccountLinkSessionToken;
};
export const newSignupSessionToken = (rawSignupSessionToken: string) => {
	return rawSignupSessionToken as SignupSessionToken;
};
export const newProviderConnectionTicketToken = (rawProviderConnectionTicketToken: string) => {
	return rawProviderConnectionTicketToken as ProviderConnectionTicketToken;
};

type AnyEntityId =
	| AccountLinkSessionId
	| EmailVerificationSessionId
	| PasswordResetSessionId
	| ProviderConnectionTicketId
	| SessionId
	| SignupSessionId;

export type AnyToken =
	| AccountLinkSessionToken
	| EmailVerificationSessionToken
	| PasswordResetSessionToken
	| ProviderConnectionTicketToken
	| SessionToken
	| SignupSessionToken;

type TokenAndIdMap =
	| [AccountLinkSessionToken, AccountLinkSessionId]
	| [EmailVerificationSessionToken, EmailVerificationSessionId]
	| [PasswordResetSessionToken, PasswordResetSessionId]
	| [ProviderConnectionTicketToken, ProviderConnectionTicketId]
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
