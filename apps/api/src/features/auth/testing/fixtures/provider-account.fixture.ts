import { newUserId } from "../../../../core/domain/value-objects";
import { ulid } from "../../../../core/lib/id";
import type { ProviderAccount } from "../../domain/entities/provider-account";
import { newIdentityProviders, newIdentityProvidersUserId } from "../../domain/value-objects/identity-providers";

export const createProviderAccountFixture = (override?: {
	providerAccount?: Partial<ProviderAccount>;
}): {
	providerAccount: ProviderAccount;
} => {
	const providerAccount: ProviderAccount = {
		provider: override?.providerAccount?.provider ?? newIdentityProviders("discord"),
		providerUserId: override?.providerAccount?.providerUserId ?? newIdentityProvidersUserId("discord_provider_user_id"),
		userId: override?.providerAccount?.userId ?? newUserId(ulid()),
		linkedAt: override?.providerAccount?.linkedAt ?? new Date(1704067200 * 1000),
	};

	return { providerAccount };
};
