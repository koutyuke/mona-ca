import type { ToPrimitive } from "../../../common/utils";
import type { OAuthProvider, OAuthProviderId, UserId } from "../../../domain/value-object";
import type { IOAuthAccountRepository } from "../../../interface-adapter/repositories/oauth-account";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type {
	GetConnectionsUseCaseResult,
	IGetConnectionsUseCase,
} from "./interfaces/get-connections.usecase.interface";

export class GetConnectionsUseCase implements IGetConnectionsUseCase {
	constructor(
		private readonly oauthAccountRepository: IOAuthAccountRepository,
		private readonly userRepository: IUserRepository,
	) {}

	public async execute(userId: UserId): Promise<GetConnectionsUseCaseResult> {
		const passwordHash = await this.userRepository.findPasswordHashById(userId);

		const providerConnections: {
			[key in ToPrimitive<OAuthProvider>]: {
				provider: OAuthProvider;
				providerId: OAuthProviderId;
				linkedAt: Date;
			} | null;
		} = {
			discord: null,
			google: null,
		};

		const oauthAccounts = await this.oauthAccountRepository.findByUserId(userId);

		for (const oauthAccount of oauthAccounts) {
			providerConnections[oauthAccount.provider as ToPrimitive<OAuthProvider>] = {
				provider: oauthAccount.provider,
				providerId: oauthAccount.providerId,
				linkedAt: oauthAccount.linkedAt,
			};
		}

		return {
			password: passwordHash !== null,
			...providerConnections,
		};
	}
}
