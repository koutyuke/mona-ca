import { ulid } from "../../../common/utils";
import type { OAuthAccount } from "../../../domain/entities";
import { newOAuthProvider, newOAuthProviderId, newUserId } from "../../../domain/value-object";

export const createOAuthAccountFixture = (override?: {
	oauthAccount?: Partial<OAuthAccount>;
}): {
	oauthAccount: OAuthAccount;
} => {
	const oauthAccount: OAuthAccount = {
		provider: override?.oauthAccount?.provider ?? newOAuthProvider("discord"),
		providerId: override?.oauthAccount?.providerId ?? newOAuthProviderId("discord_provider_id"),
		userId: override?.oauthAccount?.userId ?? newUserId(ulid()),
		linkedAt: override?.oauthAccount?.linkedAt ?? new Date(1704067200 * 1000),
	};

	return { oauthAccount };
};
