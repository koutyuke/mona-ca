import type { Gender } from "../../../../common/domain/value-objects";
import type { User } from "../../../../domain/entities";

export type UpdateUserProfileUseCaseResult = User;

export interface UpdateUserProfileDto {
	name?: string;
	iconUrl?: string | null;
	gender?: Gender;
}

export interface IUpdateUserProfileUseCase {
	execute(currentUser: User, dto: UpdateUserProfileDto): Promise<UpdateUserProfileUseCaseResult>;
}
