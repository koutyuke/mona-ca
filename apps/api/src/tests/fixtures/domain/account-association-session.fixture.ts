import { ulid } from "../../../common/utils";
import { accountAssociationSessionExpiresSpan } from "../../../domain/entities";
import type { AccountAssociationSession } from "../../../domain/entities";
import {
	type AccountAssociationSessionToken,
	formatSessionToken,
	newAccountAssociationSessionId,
	newExternalIdentityProvider,
	newExternalIdentityProviderUserId,
	newUserId,
} from "../../../domain/value-objects";
import { SessionSecretHasherMock } from "../../mocks";

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
	const secretHash = override?.accountAssociationSession?.secretHash ?? secretHasher(sessionSecret);

	const expiresAt = new Date(
		override?.accountAssociationSession?.expiresAt?.getTime() ??
			Date.now() + accountAssociationSessionExpiresSpan.milliseconds(),
	);
	expiresAt.setMilliseconds(0);

	const session: AccountAssociationSession = {
		id: override?.accountAssociationSession?.id ?? newAccountAssociationSessionId(ulid()),
		userId: override?.accountAssociationSession?.userId ?? newUserId(ulid()),
		code: override?.accountAssociationSession?.code ?? "testCode",
		secretHash: override?.accountAssociationSession?.secretHash ?? secretHash,
		email: override?.accountAssociationSession?.email ?? "test.email@example.com",
		provider: override?.accountAssociationSession?.provider ?? newExternalIdentityProvider("discord"),
		providerUserId: override?.accountAssociationSession?.providerUserId ?? newExternalIdentityProviderUserId(ulid()),
		expiresAt,
	};

	const sessionToken = formatSessionToken(session.id, sessionSecret);

	return {
		accountAssociationSession: session,
		accountAssociationSessionSecret: sessionSecret,
		accountAssociationSessionToken: sessionToken,
	};
};
