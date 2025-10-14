import { updateUser } from "../../../domain/entities";
import type { User } from "../../../domain/entities";
import type { IUpdateUserProfileUseCase, UpdateUserProfileDto, UpdateUserProfileUseCaseResult } from "../../ports/in";
import type { IUserRepository } from "../../ports/out/repositories";

export class UpdateUserProfileUseCase implements IUpdateUserProfileUseCase {
	constructor(private readonly userRepository: IUserRepository) {}

	public async execute(currentUser: User, dto: UpdateUserProfileDto): Promise<UpdateUserProfileUseCaseResult> {
		const updatedUser = updateUser(currentUser, dto);

		await this.userRepository.save(updatedUser);

		return updatedUser;
	}
}
