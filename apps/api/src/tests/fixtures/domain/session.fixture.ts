import { ulid } from "../../../common/utils";
import { type Session, sessionExpiresSpan } from "../../../domain/entities";
import { type SessionToken, formatSessionToken, newSessionId, newUserId } from "../../../domain/value-object";

export const createSessionFixture = (
	hasher: (secret: string) => Uint8Array,
	override?: {
		session?: Partial<Session>;
		sessionSecret?: string;
	},
): {
	session: Session;
	sessionSecret: string;
	sessionToken: SessionToken;
} => {
	const sessionSecret = override?.sessionSecret ?? "sessionSecret";
	const secretHash = override?.session?.secretHash ?? hasher(sessionSecret);
	const expiresAt = new Date(override?.session?.expiresAt?.getTime() ?? Date.now() + sessionExpiresSpan.milliseconds());
	expiresAt.setMilliseconds(0);

	const session: Session = {
		id: override?.session?.id ?? newSessionId(ulid()),
		userId: override?.session?.userId ?? newUserId(ulid()),
		secretHash: override?.session?.secretHash ?? secretHash,
		expiresAt,
	} satisfies Session;

	return {
		session,
		sessionSecret,
		sessionToken: formatSessionToken(session.id, sessionSecret),
	};
};
