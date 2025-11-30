import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { Gender, UserId } from "../../../../../core/domain/value-objects";
import type { UserProfile } from "../../../domain/entities/user-profile";

export interface UpdateUserProfileDto {
	name?: string;
	iconUrl?: string | null;
	gender?: Gender;
}

export type UpdateUserProfileUseCaseResult = Result<Ok<{ userProfile: UserProfile }>, Err<"USER_NOT_FOUND">>;

export interface IUpdateUserProfileUseCase {
	execute(userId: UserId, dto: UpdateUserProfileDto): Promise<UpdateUserProfileUseCaseResult>;
}
