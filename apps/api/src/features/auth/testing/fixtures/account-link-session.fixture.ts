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
	accountLinkSession?: Partial<AccountLinkSession>;
	accountLinkSessionSecret?: string;
}): {
	accountLinkSession: AccountLinkSession;
	accountLinkSessionSecret: string;
	accountLinkSessionToken: AccountLinkSessionToken;
} => {
	const secretHasher = override?.secretHasher ?? tokenSecretService.hash;

	const accountLinkSessionSecret = override?.accountLinkSessionSecret ?? "accountLinkSessionSecret";
	const secretHash = secretHasher(accountLinkSessionSecret);

	const expiresAt = new Date(
		override?.accountLinkSession?.expiresAt?.getTime() ?? Date.now() + accountLinkSessionExpiresSpan.milliseconds(),
	);
	expiresAt.setMilliseconds(0);

	const accountLinkSession: AccountLinkSession = {
		id: newAccountLinkSessionId(ulid()),
		userId: newUserId(ulid()),
		code: "testCode",
		secretHash,
		email: "test.email@example.com",
		provider: newIdentityProviders("discord"),
		providerUserId: newIdentityProvidersUserId(ulid()),
		expiresAt,
		...override?.accountLinkSession,
	};

	const accountLinkSessionToken = encodeToken(accountLinkSession.id, accountLinkSessionSecret);

	return {
		accountLinkSession,
		accountLinkSessionSecret,
		accountLinkSessionToken,
	};
};
