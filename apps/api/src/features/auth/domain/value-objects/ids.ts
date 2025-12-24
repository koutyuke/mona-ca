import type { Brand } from "@mona-ca/core/types";

export type SessionId = Brand<"SessionId", string>;

export const newSessionId = (rawSessionId: string) => {
	return rawSessionId as SessionId;
};

export type EmailVerificationRequestId = Brand<"EmailVerificationRequestId", string>;

export const newEmailVerificationRequestId = (rawEmailVerificationRequestId: string) => {
	return rawEmailVerificationRequestId as EmailVerificationRequestId;
};

export type PasswordResetSessionId = Brand<"PasswordResetSessionId", string>;

export const newPasswordResetSessionId = (rawPasswordResetSessionId: string) => {
	return rawPasswordResetSessionId as PasswordResetSessionId;
};

export type SignupSessionId = Brand<"SignupSessionId", string>;

export const newSignupSessionId = (rawSignupSessionId: string) => {
	return rawSignupSessionId as SignupSessionId;
};

export type ProviderLinkRequestId = Brand<"ProviderLinkRequestId", string>;

export const newProviderLinkRequestId = (rawProviderLinkRequestId: string) => {
	return rawProviderLinkRequestId as ProviderLinkRequestId;
};

export type AccountLinkRequestId = Brand<"AccountLinkRequestId", string>;

export const newAccountLinkRequestId = (rawAccountLinkRequestId: string) => {
	return rawAccountLinkRequestId as AccountLinkRequestId;
};
