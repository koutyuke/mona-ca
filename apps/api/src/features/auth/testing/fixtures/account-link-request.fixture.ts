import { newUserId } from "../../../../core/domain/value-objects";
import { ulid } from "../../../../core/lib/id";
import { TokenSecretServiceMock } from "../../../../core/testing/mocks/system";
import { accountLinkRequestExpiresSpan } from "../../domain/entities/account-link-request";
import { newIdentityProviders, newIdentityProvidersUserId } from "../../domain/value-objects/identity-providers";
import { newAccountLinkRequestId } from "../../domain/value-objects/ids";
import { encodeToken } from "../../domain/value-objects/tokens";

import type { AccountLinkRequest } from "../../domain/entities/account-link-request";
import type { AccountLinkRequestToken } from "../../domain/value-objects/tokens";

const tokenSecretService = new TokenSecretServiceMock();

export const createAccountLinkRequestFixture = (override?: {
	secretHasher?: (secret: string) => Uint8Array;
	accountLinkRequest?: Partial<AccountLinkRequest>;
	accountLinkRequestSecret?: string;
}): {
	accountLinkRequest: AccountLinkRequest;
	accountLinkRequestSecret: string;
	accountLinkRequestToken: AccountLinkRequestToken;
} => {
	const secretHasher = override?.secretHasher ?? tokenSecretService.hash;

	const accountLinkRequestSecret = override?.accountLinkRequestSecret ?? "accountLinkRequestSecret";
	const secretHash = secretHasher(accountLinkRequestSecret);

	const expiresAt = new Date(
		override?.accountLinkRequest?.expiresAt?.getTime() ?? Date.now() + accountLinkRequestExpiresSpan.milliseconds(),
	);
	expiresAt.setMilliseconds(0);

	const accountLinkRequest: AccountLinkRequest = {
		id: newAccountLinkRequestId(ulid()),
		userId: newUserId(ulid()),
		code: "testCode",
		secretHash,
		email: "test.email@example.com",
		provider: newIdentityProviders("discord"),
		providerUserId: newIdentityProvidersUserId(ulid()),
		expiresAt,
		...override?.accountLinkRequest,
	};

	const accountLinkRequestToken = encodeToken(accountLinkRequest.id, accountLinkRequestSecret);

	return {
		accountLinkRequest,
		accountLinkRequestSecret,
		accountLinkRequestToken,
	};
};
