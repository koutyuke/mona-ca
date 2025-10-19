import { newUserId } from "../../../../shared/domain/value-objects";
import { ulid } from "../../../../shared/lib/id";
import { SessionSecretHasherMock } from "../../../../shared/testing/mocks/system";
import {
	type AccountAssociationSession,
	accountAssociationSessionExpiresSpan,
} from "../../domain/entities/account-association-session";
import {
	newExternalIdentityProvider,
	newExternalIdentityProviderUserId,
} from "../../domain/value-objects/external-identity";
import { newAccountAssociationSessionId } from "../../domain/value-objects/ids";
import { type AccountAssociationSessionToken, formatAnySessionToken } from "../../domain/value-objects/session-token";

const sessionSecretHasher = new SessionSecretHasherMock();

export const createAccountAssociationSessionFixture = (override?: {
	secretHasher?: (secret: string) => Uint8Array;
	accountAssociationSession?: Partial<AccountAssociationSession>;
	accountAssociationSessionSecret?: string;
}): {
	accountAssociationSession: AccountAssociationSession;
	accountAssociationSessionSecret: string;
	accountAssociationSessionToken: AccountAssociationSessionToken;
} => {
	const secretHasher = override?.secretHasher ?? sessionSecretHasher.hash;

	const sessionSecret = override?.accountAssociationSessionSecret ?? "accountAssociationSessionSecret";
	const secretHash = secretHasher(sessionSecret);

	const expiresAt = new Date(
		override?.accountAssociationSession?.expiresAt?.getTime() ??
			Date.now() + accountAssociationSessionExpiresSpan.milliseconds(),
	);
	expiresAt.setMilliseconds(0);

	const session: AccountAssociationSession = {
		id: newAccountAssociationSessionId(ulid()),
		userId: newUserId(ulid()),
		code: "testCode",
		secretHash: secretHash,
		email: "test.email@example.com",
		provider: newExternalIdentityProvider("discord"),
		providerUserId: newExternalIdentityProviderUserId(ulid()),
		expiresAt,
		...override?.accountAssociationSession,
	};

	const sessionToken = formatAnySessionToken(session.id, sessionSecret);

	return {
		accountAssociationSession: session,
		accountAssociationSessionSecret: sessionSecret,
		accountAssociationSessionToken: sessionToken,
	};
};
