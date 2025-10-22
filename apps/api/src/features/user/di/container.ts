import { ProfileRepository } from "../adapters/repositories/profile/profile.repository";
import { GetProfileUseCase } from "../application/use-cases/profile/get-profile.usecase";
import { UpdateProfileUseCase } from "../application/use-cases/profile/update-profile.usecase";

import type { ICoreDIContainer } from "../../../shared/di";
import type { EnvVariables } from "../../../shared/infra/config/env";
import type { IGetProfileUseCase } from "../application/contracts/profile/get-profile.usecase.interface";
import type { IUpdateProfileUseCase } from "../application/contracts/profile/update-profile.usecase.interface";
import type { IProfileRepository } from "../application/ports/repositories/profile.repository.interface";
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

	// Repositories
	private _profileRepository: IProfileRepository | undefined;

	// Use Cases
	private _getProfileUseCase: IGetProfileUseCase | undefined;
	private _updateProfileUseCase: IUpdateProfileUseCase | undefined;

	constructor(_envVariables: EnvVariables, coreContainer: ICoreDIContainer, override?: Partial<IUserDIContainer>) {
		this.coreContainer = coreContainer;

		const overrides = override ?? {};

		// Repositories
		if (overrides.profileRepository) {
			this._profileRepository = overrides.profileRepository;
		}

		// Use Cases
		if (overrides.getProfileUseCase) {
			this._getProfileUseCase = overrides.getProfileUseCase;
		}
		if (overrides.updateProfileUseCase) {
			this._updateProfileUseCase = overrides.updateProfileUseCase;
		}
	}

	// ========================================
	// Repositories
	// ========================================
	get profileRepository(): IProfileRepository {
		if (!this._profileRepository) {
			this._profileRepository = new ProfileRepository(this.coreContainer.drizzleService);
		}
		return this._profileRepository;
	}

	// ========================================
	// Use Cases
	// ========================================
	get getProfileUseCase(): IGetProfileUseCase {
		if (!this._getProfileUseCase) {
			this._getProfileUseCase = new GetProfileUseCase(this.profileRepository);
		}
		return this._getProfileUseCase;
	}

	get updateProfileUseCase(): IUpdateProfileUseCase {
		if (!this._updateProfileUseCase) {
			this._updateProfileUseCase = new UpdateProfileUseCase(this.profileRepository);
		}
		return this._updateProfileUseCase;
	}
}
