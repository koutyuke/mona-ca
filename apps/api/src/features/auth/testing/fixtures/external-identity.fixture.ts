import { newUserId } from "../../../../core/domain/value-objects";
import { ulid } from "../../../../core/lib/id";
import type { ExternalIdentity } from "../../domain/entities/external-identity";
import {
	newExternalIdentityProvider,
	newExternalIdentityProviderUserId,
} from "../../domain/value-objects/external-identity";

export const createExternalIdentityFixture = (override?: {
	externalIdentity?: Partial<ExternalIdentity>;
}): {
	externalIdentity: ExternalIdentity;
} => {
	const externalIdentity: ExternalIdentity = {
		provider: newExternalIdentityProvider("discord"),
		providerUserId: newExternalIdentityProviderUserId("discord_provider_user_id"),
		userId: newUserId(ulid()),
		linkedAt: new Date(1704067200 * 1000),
		...override?.externalIdentity,
	};

	return { externalIdentity };
};
