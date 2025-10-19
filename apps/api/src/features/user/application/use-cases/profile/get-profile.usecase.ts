import { err, ok } from "@mona-ca/core/utils";
import type { UserId } from "../../../../../shared/domain/value-objects";
import type {
	GetProfileUseCaseResult,
	IGetProfileUseCase,
} from "../../contracts/profile/get-profile.usecase.interface";
import type { IProfileRepository } from "../../ports/repositories/profile.repository.interface";

export class GetProfileUseCase implements IGetProfileUseCase {
	constructor(private readonly profileRepository: IProfileRepository) {}

	public async execute(userId: UserId): Promise<GetProfileUseCaseResult> {
		const profile = await this.profileRepository.findById(userId);

		if (!profile) {
			return err("PROFILE_NOT_FOUND");
		}

		return ok({ profile });
	}
}
