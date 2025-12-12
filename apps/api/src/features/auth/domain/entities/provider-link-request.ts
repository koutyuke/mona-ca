import type { UserId } from "../../../../core/domain/value-objects";
import { TimeSpan } from "../../../../core/lib/time";
import type { ProviderLinkRequestId } from "../value-objects/ids";

export const PROVIDER_LINK_REQUEST_EXPIRES_SPAN_MINUTES = 3 as const;

export const providerLinkRequestExpiresSpan = new TimeSpan(PROVIDER_LINK_REQUEST_EXPIRES_SPAN_MINUTES, "m");

export interface ProviderLinkRequest {
	id: ProviderLinkRequestId;
	userId: UserId;
	secretHash: Uint8Array;
	expiresAt: Date;
}

export const createProviderLinkRequest = (args: {
	id: ProviderLinkRequestId;
	userId: UserId;
	secretHash: Uint8Array;
}): ProviderLinkRequest => {
	return {
		id: args.id,
		userId: args.userId,
		secretHash: args.secretHash,
		expiresAt: new Date(Date.now() + providerLinkRequestExpiresSpan.milliseconds()),
	};
};

export const isExpiredProviderLinkRequest = (request: ProviderLinkRequest): boolean => {
	return request.expiresAt.getTime() < Date.now();
};
