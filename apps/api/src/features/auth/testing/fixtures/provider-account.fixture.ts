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
		provider: newIdentityProviders("discord"),
		providerUserId: newIdentityProvidersUserId("discord_provider_user_id"),
		userId: newUserId(ulid()),
		linkedAt: new Date(1704067200 * 1000),
		...override?.providerAccount,
	};

	return { providerAccount };
};
