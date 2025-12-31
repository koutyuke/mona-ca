import { TimeSpan } from "../../../../core/lib/time";

import type { UserId } from "../../../../core/domain/value-objects";
import type { IdentityProviders } from "../value-objects/identity-providers";
import type { ProviderLinkRequestId } from "../value-objects/ids";

export const PROVIDER_LINK_REQUEST_EXPIRES_SPAN_MINUTES = 3 as const;

export const providerLinkRequestExpiresSpan = new TimeSpan(PROVIDER_LINK_REQUEST_EXPIRES_SPAN_MINUTES, "m");

export interface ProviderLinkRequest {
	id: ProviderLinkRequestId;
	userId: UserId;
	provider: IdentityProviders;
	secretHash: Uint8Array;
	expiresAt: Date;
}

export const createProviderLinkRequest = (args: {
	id: ProviderLinkRequestId;
	userId: UserId;
	provider: IdentityProviders;
	secretHash: Uint8Array;
}): ProviderLinkRequest => {
	return {
		id: args.id,
		userId: args.userId,
		provider: args.provider,
		secretHash: args.secretHash,
		expiresAt: new Date(Date.now() + providerLinkRequestExpiresSpan.milliseconds()),
	};
};

export const isExpiredProviderLinkRequest = (request: ProviderLinkRequest): boolean => {
	return request.expiresAt.getTime() < Date.now();
};
