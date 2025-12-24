import type { IGetUserProfileUseCase } from "../application/ports/in/user-profile/get-user-profile.usecase.interface";
import type { IUpdateUserProfileUseCase } from "../application/ports/in/user-profile/update-user-profile.usecase.interface";
import type { IUserProfileRepository } from "../application/ports/out/repositories/user-profile.repository.interface";

export interface IUserDIContainer {
	// === Repositories ===
	readonly userProfileRepository: IUserProfileRepository;

	// === Use Cases ===
	readonly getUserProfileUseCase: IGetUserProfileUseCase;
	readonly updateUserProfileUseCase: IUpdateUserProfileUseCase;
}
