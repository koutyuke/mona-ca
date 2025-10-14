import type { User } from "../../../../domain/entities";
import type { Gender } from "../../../../domain/value-objects";

export type UpdateUserProfileUseCaseResult = User;

export interface UpdateUserProfileDto {
	name?: string;
	iconUrl?: string | null;
	gender?: Gender;
}

export interface IUpdateUserProfileUseCase {
	execute(currentUser: User, dto: UpdateUserProfileDto): Promise<UpdateUserProfileUseCaseResult>;
}
