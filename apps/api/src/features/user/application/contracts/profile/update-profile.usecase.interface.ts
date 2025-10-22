import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { Gender, UserId } from "../../../../../core/domain/value-objects";
import type { Profile } from "../../../domain/entities/profile";

export interface UpdateProfileDto {
	name?: string;
	iconUrl?: string | null;
	gender?: Gender;
}

export type UpdateProfileUseCaseResult = Result<Ok<{ profile: Profile }>, Err<"PROFILE_NOT_FOUND">>;

export interface IUpdateProfileUseCase {
	execute(userId: UserId, dto: UpdateProfileDto): Promise<UpdateProfileUseCaseResult>;
}
