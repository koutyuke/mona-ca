import { newUserId } from "../../../../shared/domain/value-objects";
import { ulid } from "../../../../shared/lib/id";
import { SessionSecretHasherMock } from "../../../../shared/testing/mocks/system";
import { type Session, sessionExpiresSpan } from "../../domain/entities/session";
import { newSessionId } from "../../domain/value-objects/ids";
import { type SessionToken, formatAnySessionToken } from "../../domain/value-objects/session-token";

const sessionSecretHasher = new SessionSecretHasherMock();

export const createSessionFixture = (override?: {
	secretHasher?: (secret: string) => Uint8Array;
	session?: Partial<Session>;
	sessionSecret?: string;
}): {
	session: Session;
	sessionSecret: string;
	sessionToken: SessionToken;
} => {
	const secretHasher = override?.secretHasher ?? sessionSecretHasher.hash;

	const sessionSecret = override?.sessionSecret ?? "sessionSecret";
	const secretHash = override?.session?.secretHash ?? secretHasher(sessionSecret);

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
		sessionToken: formatAnySessionToken(session.id, sessionSecret),
	};
};
