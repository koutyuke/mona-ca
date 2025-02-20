import { TimeSpan } from "../utils";

export const EMAIL_VERIFICATION_CODE_EXPIRES_SPAN_MINUTES = 15 as const;

export const emailVerificationCodeExpiresSpan = new TimeSpan(EMAIL_VERIFICATION_CODE_EXPIRES_SPAN_MINUTES, "m");
