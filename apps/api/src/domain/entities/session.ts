import { sessionExpiresSpan, sessionRefreshSpan } from "../../common/constants";
import type { SessionId, UserId } from "../value-object";

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
