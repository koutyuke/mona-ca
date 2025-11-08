import { newUserId } from "../../../../core/domain/value-objects";
import { ulid } from "../../../../core/lib/id";
import { SessionSecretHasherMock } from "../../../../core/testing/mocks/system";
import { type AccountLinkSession, accountLinkSessionExpiresSpan } from "../../domain/entities/account-link-session";
import { newAccountLinkSessionId } from "../../domain/value-objects/ids";
import { type AccountLinkSessionToken, formatAnySessionToken } from "../../domain/value-objects/session-token";

const sessionSecretHasher = new SessionSecretHasherMock();

export const createAccountLinkSessionFixture = (override?: {
	secretHasher?: (secret: string) => Uint8Array;
	accountLinkSession?: Partial<AccountLinkSession>;
	accountLinkSessionSecret?: string;
}): {
	accountLinkSession: AccountLinkSession;
	accountLinkSessionSecret: string;
	accountLinkSessionToken: AccountLinkSessionToken;
} => {
	const secretHasher = override?.secretHasher ?? sessionSecretHasher.hash;

	const sessionSecret = override?.accountLinkSessionSecret ?? "accountLinkSessionSecret";
	const secretHash = secretHasher(sessionSecret);

	const expiresAt = new Date(
		override?.accountLinkSession?.expiresAt?.getTime() ?? Date.now() + accountLinkSessionExpiresSpan.milliseconds(),
	);
	expiresAt.setMilliseconds(0);

	const session: AccountLinkSession = {
		id: newAccountLinkSessionId(ulid()),
		userId: newUserId(ulid()),
		secretHash: secretHash,
		expiresAt,
		...override?.accountLinkSession,
	} satisfies AccountLinkSession;

	return {
		accountLinkSession: session,
		accountLinkSessionSecret: sessionSecret,
		accountLinkSessionToken: formatAnySessionToken(session.id, sessionSecret),
	};
};
