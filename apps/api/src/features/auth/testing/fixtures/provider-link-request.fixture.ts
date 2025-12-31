import { newUserId } from "../../../../core/domain/value-objects";
import { ulid } from "../../../../core/lib/id";
import { TokenSecretServiceMock } from "../../../../core/testing/mocks/system";
import { providerLinkRequestExpiresSpan } from "../../domain/entities/provider-link-request";
import { newIdentityProviders } from "../../domain/value-objects/identity-providers";
import { newProviderLinkRequestId } from "../../domain/value-objects/ids";
import { encodeToken } from "../../domain/value-objects/tokens";

import type { ProviderLinkRequest } from "../../domain/entities/provider-link-request";
import type { ProviderLinkRequestToken } from "../../domain/value-objects/tokens";

const tokenSecretService = new TokenSecretServiceMock();

export const createProviderLinkRequestFixture = (override?: {
	secretHasher?: (secret: string) => Uint8Array;
	providerLinkRequest?: Partial<ProviderLinkRequest>;
	providerLinkRequestSecret?: string;
}): {
	providerLinkRequest: ProviderLinkRequest;
	providerLinkRequestSecret: string;
	providerLinkRequestToken: ProviderLinkRequestToken;
} => {
	const secretHasher = override?.secretHasher ?? tokenSecretService.hash;

	const secret = override?.providerLinkRequestSecret ?? "providerLinkRequestSecret";
	const secretHash = secretHasher(secret);

	const expiresAt = new Date(
		override?.providerLinkRequest?.expiresAt?.getTime() ?? Date.now() + providerLinkRequestExpiresSpan.milliseconds(),
	);
	expiresAt.setMilliseconds(0);

	const providerLinkRequest: ProviderLinkRequest = {
		id: newProviderLinkRequestId(ulid()),
		userId: newUserId(ulid()),
		provider: override?.providerLinkRequest?.provider ?? newIdentityProviders("discord"),
		secretHash,
		expiresAt,
		...override?.providerLinkRequest,
	};

	return {
		providerLinkRequest,
		providerLinkRequestSecret: secret,
		providerLinkRequestToken: encodeToken(providerLinkRequest.id, secret),
	};
};
