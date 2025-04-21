import type { Err, Result } from "../../../../common/utils";
import type { OAuthProvider, UserId } from "../../../../domain/value-object";

export type UnlinkAccountUseCaseSuccessResult = {
	message: string;
};

export type UnlinkAccountUseCaseErrorResult = Err<"ACCOUNT_NOT_LINKED"> | Err<"FAILED_TO_UNLINK_ACCOUNT">;

export type UnlinkAccountUseCaseResult = Result<UnlinkAccountUseCaseSuccessResult, UnlinkAccountUseCaseErrorResult>;

export interface IUnlinkAccountUseCase {
	execute(userId: UserId, provider: OAuthProvider): Promise<UnlinkAccountUseCaseResult>;
}
