import { newUserId } from "../../../../core/domain/value-objects";
import { ulid } from "../../../../core/lib/id";
import { SessionSecretHasherMock } from "../../../../core/testing/mocks/system";
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
	const secretHash = secretHasher(sessionSecret);

	const expiresAt = new Date(override?.session?.expiresAt?.getTime() ?? Date.now() + sessionExpiresSpan.milliseconds());
	expiresAt.setMilliseconds(0);

	const session: Session = {
		id: newSessionId(ulid()),
		userId: newUserId(ulid()),
		secretHash: secretHash,
		expiresAt,
		...override?.session,
	} satisfies Session;

	return {
		session,
		sessionSecret,
		sessionToken: formatAnySessionToken(session.id, sessionSecret),
	};
};
