import { err, ok } from "@mona-ca/core/result";
import { updateUserProfile } from "../../../domain/entities/user-profile";

import type { UserId } from "../../../../../core/domain/value-objects";
import type {
	IUpdateUserProfileUseCase,
	UpdateUserProfileDto,
	UpdateUserProfileUseCaseResult,
} from "../../ports/in/user-profile/update-user-profile.usecase.interface";
import type { IUserProfileRepository } from "../../ports/out/repositories/user-profile.repository.interface";

export class UpdateUserProfileUseCase implements IUpdateUserProfileUseCase {
	constructor(private readonly userProfileRepository: IUserProfileRepository) {}

	public async execute(userId: UserId, dto: UpdateUserProfileDto): Promise<UpdateUserProfileUseCaseResult> {
		const userProfile = await this.userProfileRepository.findById(userId);
		if (!userProfile) {
			return err("USER_NOT_FOUND");
		}
		const updatedUserProfile = updateUserProfile(userProfile, dto);

		await this.userProfileRepository.save(updatedUserProfile);

		return ok({ userProfile: updatedUserProfile });
	}
}
