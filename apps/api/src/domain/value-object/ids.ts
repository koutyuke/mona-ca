import type { NewType } from "../../common/utils";

export type UserId = NewType<"UserId", string>;

export const newUserId = (rawUserId: string) => {
	return rawUserId as UserId;
};

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
