import type { Result, ToPrimitive } from "../../../../common/utils";
import type { OAuthProvider, OAuthProviderId, UserId } from "../../../../domain/value-object";

export type GetConnectionsUseCaseSuccessResult = {
	password: boolean;
} & {
	[key in ToPrimitive<OAuthProvider>]: {
		provider: OAuthProvider;
		providerId: OAuthProviderId;
		linkedAt: Date;
	} | null;
};

export type GetConnectionsUseCaseError = never;

export type GetConnectionsUseCaseResult = Result<GetConnectionsUseCaseSuccessResult, GetConnectionsUseCaseError>;

export interface IGetConnectionsUseCase {
	execute: (userId: UserId) => Promise<GetConnectionsUseCaseResult>;
}
