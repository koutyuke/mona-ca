import { newUserId } from "../../../../core/domain/value-objects";
import { ulid } from "../../../../core/lib/id";
import { TokenSecretServiceMock } from "../../../../core/testing/mocks/system";
import { type AccountLinkSession, accountLinkSessionExpiresSpan } from "../../domain/entities/account-link-session";
import { newIdentityProviders, newIdentityProvidersUserId } from "../../domain/value-objects/identity-providers";
import { newAccountLinkSessionId } from "../../domain/value-objects/ids";
import { type AccountLinkSessionToken, encodeToken } from "../../domain/value-objects/tokens";

const tokenSecretService = new TokenSecretServiceMock();

export const createAccountLinkSessionFixture = (override?: {
	secretHasher?: (secret: string) => Uint8Array;
	session?: Partial<AccountLinkSession>;
	secret?: string;
}): {
	session: AccountLinkSession;
	secret: string;
	token: AccountLinkSessionToken;
} => {
	const secretHasher = override?.secretHasher ?? tokenSecretService.hash;

	const sessionSecret = override?.secret ?? "accountLinkSessionSecret";
	const secretHash = secretHasher(sessionSecret);

	const expiresAt = new Date(
		override?.session?.expiresAt?.getTime() ?? Date.now() + accountLinkSessionExpiresSpan.milliseconds(),
	);
	expiresAt.setMilliseconds(0);

	const session: AccountLinkSession = {
		id: newAccountLinkSessionId(ulid()),
		userId: newUserId(ulid()),
		code: "testCode",
		secretHash: secretHash,
		email: "test.email@example.com",
		provider: newIdentityProviders("discord"),
		providerUserId: newIdentityProvidersUserId(ulid()),
		expiresAt,
		...override?.session,
	};

	const sessionToken = encodeToken(session.id, sessionSecret);

	return {
		session,
		secret: sessionSecret,
		token: sessionToken,
	};
};
