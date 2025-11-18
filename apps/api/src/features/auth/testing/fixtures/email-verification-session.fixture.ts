import { newUserId } from "../../../../core/domain/value-objects";
import { ulid } from "../../../../core/lib/id";
import { TokenSecretServiceMock } from "../../../../core/testing/mocks/system";
import {
	type EmailVerificationSession,
	emailVerificationSessionExpiresSpan,
} from "../../domain/entities/email-verification-session";
import { newEmailVerificationSessionId } from "../../domain/value-objects/ids";
import { type EmailVerificationSessionToken, encodeToken } from "../../domain/value-objects/tokens";

const tokenSecretService = new TokenSecretServiceMock();

export const createEmailVerificationSessionFixture = (override?: {
	secretHasher?: (secret: string) => Uint8Array;
	emailVerificationSession?: Partial<EmailVerificationSession>;
	emailVerificationSecret?: string;
}): {
	emailVerificationSession: EmailVerificationSession;
	emailVerificationSessionSecret: string;
	emailVerificationSessionToken: EmailVerificationSessionToken;
} => {
	const secretHasher = override?.secretHasher ?? tokenSecretService.hash;

	const emailVerificationSessionSecret = override?.emailVerificationSecret ?? "emailVerificationSessionSecret";
	const secretHash = secretHasher(emailVerificationSessionSecret);

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
		emailVerificationSessionSecret: emailVerificationSessionSecret,
		emailVerificationSessionToken: encodeToken(session.id, emailVerificationSessionSecret),
	};
};
