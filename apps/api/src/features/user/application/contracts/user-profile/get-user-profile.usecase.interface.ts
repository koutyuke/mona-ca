import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { UserId } from "../../../../../core/domain/value-objects";
import type { UserProfile } from "../../../domain/entities/user-profile";

export type GetUserProfileUseCaseResult = Result<Ok<{ userProfile: UserProfile }>, Err<"USER_NOT_FOUND">>;

export interface IGetUserProfileUseCase {
	execute(userId: UserId): Promise<GetUserProfileUseCaseResult>;
}
