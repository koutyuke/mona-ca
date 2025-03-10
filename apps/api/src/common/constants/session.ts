import { TimeSpan } from "../utils";

export const SESSION_EXPIRES_SPAN_DAYS = 30 as const;
export const SESSION_REFRESH_SPAN_DAYS = 15 as const;

export const sessionExpiresSpan = new TimeSpan(SESSION_EXPIRES_SPAN_DAYS, "d");
export const sessionRefreshSpan = new TimeSpan(SESSION_REFRESH_SPAN_DAYS, "d");

export const EMAIL_VERIFICATION_SESSION_EXPIRES_SPAN_MINUTES = 15 as const;

export const emailVerificationSessionExpiresSpan = new TimeSpan(EMAIL_VERIFICATION_SESSION_EXPIRES_SPAN_MINUTES, "m");
