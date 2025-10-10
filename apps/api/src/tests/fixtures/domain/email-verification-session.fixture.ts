import { ulid } from "../../../common/utils";
import { type EmailVerificationSession, emailVerificationSessionExpiresSpan } from "../../../domain/entities";
import {
	type EmailVerificationSessionToken,
	formatSessionToken,
	newEmailVerificationSessionId,
	newUserId,
} from "../../../domain/value-object";
import { hashSessionSecret } from "../../../infrastructure/crypt";

export const createEmailVerificationSessionFixture = (override?: {
	emailVerificationSession?: Partial<EmailVerificationSession>;
	emailVerificationSecret?: string;
}): {
	emailVerificationSession: EmailVerificationSession;
	emailVerificationSessionSecret: string;
	emailVerificationSessionToken: EmailVerificationSessionToken;
} => {
	const sessionSecret = override?.emailVerificationSecret ?? "emailVerificationSessionSecret";
	const secretHash = hashSessionSecret(sessionSecret);

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
