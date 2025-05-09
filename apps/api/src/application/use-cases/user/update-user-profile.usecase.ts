import { updateUser } from "../../../domain/entities";
import type { User } from "../../../domain/entities";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type {
	IUpdateUserProfileUseCase,
	UpdateUserProfileDto,
	UpdateUserProfileUseCaseResult,
} from "./interfaces/update-user-profile.usecase.interface";

export class UpdateUserProfileUseCase implements IUpdateUserProfileUseCase {
	constructor(private readonly userRepository: IUserRepository) {}

	public async execute(currentUser: User, dto: UpdateUserProfileDto): Promise<UpdateUserProfileUseCaseResult> {
		const updatedUser = updateUser(currentUser, dto);

		await this.userRepository.save(updatedUser);

		return updatedUser;
	}
}
