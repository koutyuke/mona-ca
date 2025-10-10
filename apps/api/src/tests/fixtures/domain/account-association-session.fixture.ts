import { ulid } from "../../../common/utils";
import { accountAssociationSessionExpiresSpan } from "../../../domain/entities";
import type { AccountAssociationSession } from "../../../domain/entities";
import {
	type AccountAssociationSessionToken,
	formatSessionToken,
	newAccountAssociationSessionId,
	newOAuthProvider,
	newOAuthProviderId,
	newUserId,
} from "../../../domain/value-object";
import { hashSessionSecret } from "../../../infrastructure/crypt";

export const createAccountAssociationSessionFixture = (override?: {
	accountAssociationSession?: Partial<AccountAssociationSession>;
	accountAssociationSessionSecret?: string;
}): {
	accountAssociationSession: AccountAssociationSession;
	accountAssociationSessionSecret: string;
	accountAssociationSessionToken: AccountAssociationSessionToken;
} => {
	const sessionSecret = override?.accountAssociationSessionSecret ?? "accountAssociationSessionSecret";
	const secretHash = hashSessionSecret(sessionSecret);

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
		provider: override?.accountAssociationSession?.provider ?? newOAuthProvider("discord"),
		providerId: override?.accountAssociationSession?.providerId ?? newOAuthProviderId(ulid()),
		expiresAt,
	};

	const sessionToken = formatSessionToken(session.id, sessionSecret);

	return {
		accountAssociationSession: session,
		accountAssociationSessionSecret: sessionSecret,
		accountAssociationSessionToken: sessionToken,
	};
};
