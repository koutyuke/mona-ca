import type { ToPrimitive } from "@mona-ca/core/utils";
import type { UserIdentity } from "../../../domain/entities/user-identity";
import type {
	ExternalIdentityProvider,
	ExternalIdentityProviderUserId,
} from "../../../domain/value-objects/external-identity";

export type GetConnectionsUseCaseResult = {
	password: boolean;
} & {
	[key in ToPrimitive<ExternalIdentityProvider>]: {
		provider: ExternalIdentityProvider;
		providerUserId: ExternalIdentityProviderUserId;
		linkedAt: Date;
	} | null;
};

export interface IGetConnectionsUseCase {
	execute(userIdentity: UserIdentity): Promise<GetConnectionsUseCaseResult>;
}
