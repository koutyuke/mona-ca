import { err, ok } from "@mona-ca/core/utils";
import type { UserId } from "../../../../../core/domain/value-objects";
import type {
	GetUserProfileUseCaseResult,
	IGetUserProfileUseCase,
} from "../../contracts/user-profile/get-user-profile.usecase.interface";
import type { IUserProfileRepository } from "../../ports/repositories/user-profile.repository.interface";

export class GetUserProfileUseCase implements IGetUserProfileUseCase {
	constructor(private readonly userProfileRepository: IUserProfileRepository) {}

	public async execute(userId: UserId): Promise<GetUserProfileUseCaseResult> {
		const userProfile = await this.userProfileRepository.findById(userId);

		if (!userProfile) {
			return err("USER_NOT_FOUND");
		}

		return ok({ userProfile });
	}
}
