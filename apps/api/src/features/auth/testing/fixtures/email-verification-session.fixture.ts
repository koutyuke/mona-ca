import { type EmailVerificationSession, emailVerificationSessionExpiresSpan } from "../../../domain/entities";
import {
	type EmailVerificationSessionToken,
	formatSessionToken,
	newEmailVerificationSessionId,
	newUserId,
} from "../../../shared/domain/value-objects";
import { ulid } from "../../../shared/lib/types";
import { SessionSecretHasherMock } from "../../mocks";

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
	const secretHash = override?.emailVerificationSession?.secretHash ?? secretHasher(sessionSecret);

	const expiresAt = new Date(
		override?.emailVerificationSession?.expiresAt?.getTime() ??
			Date.now() + emailVerificationSessionExpiresSpan.milliseconds(),
	);
	expiresAt.setMilliseconds(0);

	const session: EmailVerificationSession = {
		id: override?.emailVerificationSession?.id ?? newEmailVerificationSessionId(ulid()),
		email: override?.emailVerificationSession?.email ?? "test.email@example.com",
		userId: override?.emailVerificationSession?.userId ?? newUserId(ulid()),
		code: override?.emailVerificationSession?.code ?? "testCode",
		secretHash: override?.emailVerificationSession?.secretHash ?? secretHash,
		expiresAt,
	} satisfies EmailVerificationSession;

	return {
		emailVerificationSession: session,
		emailVerificationSessionSecret: sessionSecret,
		emailVerificationSessionToken: formatSessionToken(session.id, sessionSecret),
	};
};
