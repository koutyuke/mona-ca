import type { Err, Result } from "../../../../common/utils";
import type { OAuthProvider, UserId } from "../../../../domain/value-object";

export type UnlinkAccountConnectionUseCaseSuccessResult = undefined;

export type UnlinkAccountConnectionUseCaseErrorResult = Err<"ACCOUNT_NOT_LINKED"> | Err<"FAILED_TO_UNLINK_ACCOUNT">;

export type UnlinkAccountConnectionUseCaseResult = Result<
	UnlinkAccountConnectionUseCaseSuccessResult,
	UnlinkAccountConnectionUseCaseErrorResult
>;

export interface IUnlinkAccountConnectionUseCase {
	execute(provider: OAuthProvider, userId: UserId): Promise<UnlinkAccountConnectionUseCaseResult>;
}
