import { newUserId } from "../../../../core/domain/value-objects";
import { ulid } from "../../../../core/lib/id";
import { TokenSecretServiceMock } from "../../../../core/testing/mocks/system";
import { type ProviderLinkRequest, providerLinkRequestExpiresSpan } from "../../domain/entities/provider-link-request";
import { newProviderLinkRequestId } from "../../domain/value-objects/ids";
import { type ProviderLinkRequestToken, encodeToken } from "../../domain/value-objects/tokens";

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

	const request: ProviderLinkRequest = {
		id: newProviderLinkRequestId(ulid()),
		userId: newUserId(ulid()),
		secretHash: secretHash,
		expiresAt,
		...override?.providerLinkRequest,
	} satisfies ProviderLinkRequest;

	return {
		providerLinkRequest: request,
		providerLinkRequestSecret: secret,
		providerLinkRequestToken: encodeToken(request.id, secret),
	};
};
