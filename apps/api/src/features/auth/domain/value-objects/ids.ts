import type { Brand } from "@mona-ca/core/types";

export type SessionId = Brand<"SessionId", string>;

export const newSessionId = (rawSessionId: string) => {
	return rawSessionId as SessionId;
};

export type EmailVerificationSessionId = Brand<"EmailVerificationSessionId", string>;

export const newEmailVerificationSessionId = (rawEmailVerificationSessionId: string) => {
	return rawEmailVerificationSessionId as EmailVerificationSessionId;
};

export type PasswordResetSessionId = Brand<"PasswordResetSessionId", string>;

export const newPasswordResetSessionId = (rawPasswordResetSessionId: string) => {
	return rawPasswordResetSessionId as PasswordResetSessionId;
};

export type SignupSessionId = Brand<"SignupSessionId", string>;

export const newSignupSessionId = (rawSignupSessionId: string) => {
	return rawSignupSessionId as SignupSessionId;
};

export type ProviderConnectionTicketId = Brand<"ProviderConnectionTicketId", string>;

export const newProviderConnectionTicketId = (rawProviderConnectionTicketId: string) => {
	return rawProviderConnectionTicketId as ProviderConnectionTicketId;
};

export type AccountLinkSessionId = Brand<"AccountLinkSessionId", string>;

export const newAccountLinkSessionId = (rawAccountLinkSessionId: string) => {
	return rawAccountLinkSessionId as AccountLinkSessionId;
};
