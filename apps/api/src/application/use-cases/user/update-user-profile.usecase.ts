import { User } from "../../../domain/entities";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type {
	IUpdateUserProfileUseCase,
	UpdateUserProfileDto,
	UpdateUserProfileUseCaseResult,
} from "./interfaces/update-user-profile.usecase.interface";

export class UpdateUserProfileUseCase implements IUpdateUserProfileUseCase {
	constructor(private userRepository: IUserRepository) {}

	public async execute(currentUser: User, dto: UpdateUserProfileDto): Promise<UpdateUserProfileUseCaseResult> {
		const updatedUser = new User({
			...currentUser,
			...dto,
			updatedAt: new Date(),
		});

		await this.userRepository.save(updatedUser);

		return updatedUser;
	}
}
