import {
	newExternalIdentityProvider,
	newExternalIdentityProviderUserId,
	newUserId,
} from "../../../common/domain/value-objects";
import type { ExternalIdentity } from "../../../domain/entities";
import { ulid } from "../../../lib/utils";

export const createExternalIdentityFixture = (override?: {
	externalIdentity?: Partial<ExternalIdentity>;
}): {
	externalIdentity: ExternalIdentity;
} => {
	const externalIdentity: ExternalIdentity = {
		provider: override?.externalIdentity?.provider ?? newExternalIdentityProvider("discord"),
		providerUserId:
			override?.externalIdentity?.providerUserId ?? newExternalIdentityProviderUserId("discord_provider_user_id"),
		userId: override?.externalIdentity?.userId ?? newUserId(ulid()),
		linkedAt: override?.externalIdentity?.linkedAt ?? new Date(1704067200 * 1000),
	};

	return { externalIdentity };
};
