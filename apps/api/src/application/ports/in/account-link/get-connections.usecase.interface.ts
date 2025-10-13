import type { Result, ToPrimitive } from "../../../../common/utils";
import type { ExternalIdentityProvider, ExternalIdentityProviderUserId, UserId } from "../../../../domain/value-object";

export type GetConnectionsUseCaseSuccessResult = {
	password: boolean;
} & {
	[key in ToPrimitive<ExternalIdentityProvider>]: {
		provider: ExternalIdentityProvider;
		providerUserId: ExternalIdentityProviderUserId;
		linkedAt: Date;
	} | null;
};

export type GetConnectionsUseCaseError = never;

export type GetConnectionsUseCaseResult = Result<GetConnectionsUseCaseSuccessResult, GetConnectionsUseCaseError>;

export interface IGetConnectionsUseCase {
	execute: (userId: UserId) => Promise<GetConnectionsUseCaseResult>;
}
