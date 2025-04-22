import type { Static } from "elysia";
import { type Err, type Result, TimeSpan, err, isErr } from "../../../common/utils";
import {
	type OAuthProvider,
	type OAuthProviderId,
	type UserId,
	newOAuthProvider,
	newOAuthProviderId,
	newUserId,
} from "../../../domain/value-object";
import { generateSignedState, validateSignedState } from "../../../interface-adapter/gateway/oauth-provider";
import { accountAssociationStateSchema } from "./schema";

const ACCOUNT_ASSOCIATION_SESSION_EXPIRES_SPAN_MINUTES = 10 as const;

const accountAssociationSessionExpiresSpan = new TimeSpan(ACCOUNT_ASSOCIATION_SESSION_EXPIRES_SPAN_MINUTES, "m");

export const generateAccountAssociationState = (
	userId: UserId,
	provider: OAuthProvider,
	providerId: OAuthProviderId,
	HMACSecret: string,
): { state: string; expiresAt: Date } => {
	const expiresAt = new Date(Date.now() + accountAssociationSessionExpiresSpan.milliseconds());

	const state = generateSignedState<Static<typeof accountAssociationStateSchema>>(
		{
			uid: userId,
			provider,
			provider_id: providerId,
			expires_at: expiresAt.getTime(),
		},
		HMACSecret,
	);
	return { state, expiresAt };
};

type ValidateAccountAssociationStateResult = Result<
	{
		userId: UserId;
		provider: OAuthProvider;
		providerId: OAuthProviderId;
		expiresAt: Date;
	},
	Err<"INVALID_SIGNED_STATE"> | Err<"FAILED_TO_DECODE_SIGNED_STATE"> | Err<"EXPIRED_STATE">
>;

export const validateAccountAssociationState = (
	state: string,
	HMACSecret: string,
): ValidateAccountAssociationStateResult => {
	const result = validateSignedState(state, HMACSecret, accountAssociationStateSchema);

	if (isErr(result)) {
		return result;
	}

	const { uid, provider, provider_id, expires_at } = result;

	if (expires_at < Date.now()) {
		return err("EXPIRED_STATE");
	}

	return {
		userId: newUserId(uid),
		provider: newOAuthProvider(provider),
		providerId: newOAuthProviderId(provider_id),
		expiresAt: new Date(expires_at),
	};
};
