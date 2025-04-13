import { sessionExpiresSpan, sessionRefreshSpan } from "../../common/constants";
import type { SessionId, UserId } from "../value-object";

export interface Session {
	id: SessionId;
	userId: UserId;
	expiresAt: Date;
}

export const createSession = (arg: {
	id: SessionId;
	userId: UserId;
}): Session => ({
	id: arg.id,
	userId: arg.userId,
	expiresAt: new Date(Date.now() + sessionExpiresSpan.milliseconds()),
});

export const isExpiredSession = (session: Session): boolean => {
	return session.expiresAt.getTime() < Date.now();
};

export const isRefreshableSession = (session: Session): boolean => {
	return Date.now() >= session.expiresAt.getTime() - sessionRefreshSpan.milliseconds();
};
