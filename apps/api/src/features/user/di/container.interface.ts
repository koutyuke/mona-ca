import type { IGetProfileUseCase } from "../application/contracts/profile/get-profile.usecase.interface";
import type { IUpdateProfileUseCase } from "../application/contracts/profile/update-profile.usecase.interface";
import type { IProfileRepository } from "../application/ports/repositories/profile.repository.interface";

export interface IUserDIContainer {
	// Repositories
	readonly profileRepository: IProfileRepository;

	// Use Cases
	readonly getProfileUseCase: IGetProfileUseCase;
	readonly updateProfileUseCase: IUpdateProfileUseCase;
}
