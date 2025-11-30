import type { IGetUserProfileUseCase } from "../application/contracts/user-profile/get-user-profile.usecase.interface";
import type { IUpdateUserProfileUseCase } from "../application/contracts/user-profile/update-user-profile.usecase.interface";
import type { IUserProfileRepository } from "../application/ports/repositories/user-profile.repository.interface";

export interface IUserDIContainer {
	// === Repositories ===
	readonly userProfileRepository: IUserProfileRepository;

	// === Use Cases ===
	readonly getUserProfileUseCase: IGetUserProfileUseCase;
	readonly updateUserProfileUseCase: IUpdateUserProfileUseCase;
}
