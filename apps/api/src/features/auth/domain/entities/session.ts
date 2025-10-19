import type { UserId } from "../../../../shared/domain/value-objects";
import { TimeSpan } from "../../../../shared/lib/time";
import type { SessionId } from "../value-objects/ids";

export const SESSION_EXPIRES_SPAN_DAYS = 30 as const;
export const SESSION_REFRESH_SPAN_DAYS = 15 as const;

export const sessionExpiresSpan = new TimeSpan(SESSION_EXPIRES_SPAN_DAYS, "d");
export const sessionRefreshSpan = new TimeSpan(SESSION_REFRESH_SPAN_DAYS, "d");

export interface Session {
	id: SessionId;
	userId: UserId;
	secretHash: Uint8Array;
	expiresAt: Date;
}

export const createSession = (arg: {
	id: SessionId;
	userId: UserId;
	secretHash: Uint8Array;
}): Session => ({
	id: arg.id,
	userId: arg.userId,
	secretHash: arg.secretHash,
	expiresAt: new Date(Date.now() + sessionExpiresSpan.milliseconds()),
});

export const isExpiredSession = (session: Session): boolean => {
	return session.expiresAt.getTime() < Date.now();
};

export const isRefreshableSession = (session: Session): boolean => {
	return session.expiresAt.getTime() - sessionRefreshSpan.milliseconds() < Date.now();
};
