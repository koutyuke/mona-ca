import { TimeSpan } from "../utils";

export const EMAIL_VERIFICATION_EXPIRES_SPAN_MINUTES = 15 as const;

export const emailVerificationExpiresSpan = new TimeSpan(EMAIL_VERIFICATION_EXPIRES_SPAN_MINUTES, "m");
