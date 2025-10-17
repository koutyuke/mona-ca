import type { ToPrimitive } from "@mona-ca/core/utils";
import type {
	ExternalIdentityProvider,
	ExternalIdentityProviderUserId,
	UserId,
} from "../../../../../../common/domain/value-objects";

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
	execute: (userId: UserId) => Promise<GetConnectionsUseCaseResult>;
}
