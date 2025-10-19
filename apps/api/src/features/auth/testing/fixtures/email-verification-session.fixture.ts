import { newUserId } from "../../../../shared/domain/value-objects";
import { ulid } from "../../../../shared/lib/id";
import { SessionSecretHasherMock } from "../../../../shared/testing/mocks/system";
import {
	type EmailVerificationSession,
	emailVerificationSessionExpiresSpan,
} from "../../domain/entities/email-verification-session";
import { newEmailVerificationSessionId } from "../../domain/value-objects/ids";
import { type EmailVerificationSessionToken, formatAnySessionToken } from "../../domain/value-objects/session-token";

const sessionSecretHasher = new SessionSecretHasherMock();

export const createEmailVerificationSessionFixture = (override?: {
	secretHasher?: (secret: string) => Uint8Array;
	emailVerificationSession?: Partial<EmailVerificationSession>;
	emailVerificationSecret?: string;
}): {
	emailVerificationSession: EmailVerificationSession;
	emailVerificationSessionSecret: string;
	emailVerificationSessionToken: EmailVerificationSessionToken;
} => {
	const secretHasher = override?.secretHasher ?? sessionSecretHasher.hash;

	const sessionSecret = override?.emailVerificationSecret ?? "emailVerificationSessionSecret";
	const secretHash = secretHasher(sessionSecret);

	const expiresAt = new Date(
		override?.emailVerificationSession?.expiresAt?.getTime() ??
			Date.now() + emailVerificationSessionExpiresSpan.milliseconds(),
	);
	expiresAt.setMilliseconds(0);

	const session: EmailVerificationSession = {
		id: newEmailVerificationSessionId(ulid()),
		email: "test.email@example.com",
		userId: newUserId(ulid()),
		code: "testCode",
		secretHash: secretHash,
		expiresAt,
		...override?.emailVerificationSession,
	} satisfies EmailVerificationSession;

	return {
		emailVerificationSession: session,
		emailVerificationSessionSecret: sessionSecret,
		emailVerificationSessionToken: formatAnySessionToken(session.id, sessionSecret),
	};
};
