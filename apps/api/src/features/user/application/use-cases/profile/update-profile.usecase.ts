import { err, ok } from "@mona-ca/core/utils";
import type { UserId } from "../../../../../shared/domain/value-objects";
import { updateProfile } from "../../../domain/entities/profile";
import type {
	IUpdateProfileUseCase,
	UpdateProfileDto,
	UpdateProfileUseCaseResult,
} from "../../contracts/profile/update-profile.usecase.interface";

import type { IProfileRepository } from "../../ports/repositories/profile.repository.interface";

export class UpdateProfileUseCase implements IUpdateProfileUseCase {
	constructor(private readonly profileRepository: IProfileRepository) {}

	public async execute(userId: UserId, dto: UpdateProfileDto): Promise<UpdateProfileUseCaseResult> {
		const profile = await this.profileRepository.findById(userId);
		if (!profile) {
			return err("PROFILE_NOT_FOUND");
		}
		const updatedProfile = updateProfile(profile, dto);

		await this.profileRepository.save(updatedProfile);

		return ok({ profile: updatedProfile });
	}
}
