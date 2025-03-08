import type { NewType } from "../../common/utils";

export type UserId = NewType<"UserId", string>;

export const newUserId = (rawUserId: string) => {
	return rawUserId as UserId;
};

export type SessionId = NewType<"SessionId", string>;

export const newSessionId = (rawSessionId: string) => {
	return rawSessionId as SessionId;
};

export type EmailVerificationId = NewType<"EmailVerificationId", string>;

export const newEmailVerificationId = (rawEmailVerificationId: string) => {
	return rawEmailVerificationId as EmailVerificationId;
};
