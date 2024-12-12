import { TimeSpan } from "../utils/time-span";

export const SESSION_EXPIRES_SPAN_DAYS = 30 as const;
export const SESSION_REFRESH_SPAN_DAYS = 15 as const;

export const sessionExpiresSpan = new TimeSpan(SESSION_EXPIRES_SPAN_DAYS, "d");
export const sessionRefreshSpan = new TimeSpan(SESSION_REFRESH_SPAN_DAYS, "d");
