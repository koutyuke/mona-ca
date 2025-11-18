import type { NewType } from "@mona-ca/core/utils";

export type SessionId = NewType<"SessionId", string>;

export const newSessionId = (rawSessionId: string) => {
	return rawSessionId as SessionId;
};

export type EmailVerificationSessionId = NewType<"EmailVerificationSessionId", string>;

export const newEmailVerificationSessionId = (rawEmailVerificationSessionId: string) => {
	return rawEmailVerificationSessionId as EmailVerificationSessionId;
};

export type PasswordResetSessionId = NewType<"PasswordResetSessionId", string>;

export const newPasswordResetSessionId = (rawPasswordResetSessionId: string) => {
	return rawPasswordResetSessionId as PasswordResetSessionId;
};

export type SignupSessionId = NewType<"SignupSessionId", string>;

export const newSignupSessionId = (rawSignupSessionId: string) => {
	return rawSignupSessionId as SignupSessionId;
};

export type ProviderConnectionTicketId = NewType<"ProviderConnectionTicketId", string>;

export const newProviderConnectionTicketId = (rawProviderConnectionTicketId: string) => {
	return rawProviderConnectionTicketId as ProviderConnectionTicketId;
};

export type AccountLinkSessionId = NewType<"AccountLinkSessionId", string>;

export const newAccountLinkSessionId = (rawAccountLinkSessionId: string) => {
	return rawAccountLinkSessionId as AccountLinkSessionId;
};
