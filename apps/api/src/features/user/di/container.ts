import { UserProfileRepository } from "../adapters/repositories/user-profile/user-profile.repository";
import { GetUserProfileUseCase } from "../application/use-cases/user-profile/get-user-profile.usecase";
import { UpdateUserProfileUseCase } from "../application/use-cases/user-profile/update-user-profile.usecase";

import type { ICoreDIContainer } from "../../../core/di";
import type { EnvVariables } from "../../../core/infra/config/env";
import type { IGetUserProfileUseCase } from "../application/contracts/user-profile/get-user-profile.usecase.interface";
import type { IUpdateUserProfileUseCase } from "../application/contracts/user-profile/update-user-profile.usecase.interface";
import type { IUserProfileRepository } from "../application/ports/repositories/user-profile.repository.interface";
import type { IUserDIContainer } from "./container.interface";

/**
 * UserDIContainer
 *
 * User機能のリポジトリとユースケースをSingletonとして管理するDIコンテナ
 *
 * @remarks
 * - SharedDIContainerへの参照を保持し、共通の依存関係を取得
 * - Lazy Initializationパターンでインスタンスを生成
 * - 完全にstatelessなため、Singletonとして使用しても安全
 */
export class UserDIContainer implements IUserDIContainer {
	private readonly coreContainer: ICoreDIContainer;

	// === Repositories ===
	private _userProfileRepository: IUserProfileRepository | undefined;

	// === Use Cases ===
	private _getUserProfileUseCase: IGetUserProfileUseCase | undefined;
	private _updateUserProfileUseCase: IUpdateUserProfileUseCase | undefined;

	constructor(_envVariables: EnvVariables, coreContainer: ICoreDIContainer, override?: Partial<IUserDIContainer>) {
		this.coreContainer = coreContainer;

		const overrides = override ?? {};

		// === Repositories ===
		if (overrides.userProfileRepository) {
			this._userProfileRepository = overrides.userProfileRepository;
		}

		// Use Cases
		if (overrides.getUserProfileUseCase) {
			this._getUserProfileUseCase = overrides.getUserProfileUseCase;
		}
		if (overrides.updateUserProfileUseCase) {
			this._updateUserProfileUseCase = overrides.updateUserProfileUseCase;
		}
	}

	// === Repositories ===
	get userProfileRepository(): IUserProfileRepository {
		if (!this._userProfileRepository) {
			this._userProfileRepository = new UserProfileRepository(this.coreContainer.drizzleService);
		}
		return this._userProfileRepository;
	}

	// === Use Cases ===

	// User Profile
	get getUserProfileUseCase(): IGetUserProfileUseCase {
		if (!this._getUserProfileUseCase) {
			this._getUserProfileUseCase = new GetUserProfileUseCase(this.userProfileRepository);
		}
		return this._getUserProfileUseCase;
	}

	get updateUserProfileUseCase(): IUpdateUserProfileUseCase {
		if (!this._updateUserProfileUseCase) {
			this._updateUserProfileUseCase = new UpdateUserProfileUseCase(this.userProfileRepository);
		}
		return this._updateUserProfileUseCase;
	}
}
