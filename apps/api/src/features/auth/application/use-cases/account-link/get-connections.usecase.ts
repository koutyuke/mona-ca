import type { ToPrimitive } from "@mona-ca/core/utils";
import type { GetConnectionsUseCaseResult, IGetConnectionsUseCase } from "../../../../../application/ports/in";
import type {
	ExternalIdentityProvider,
	ExternalIdentityProviderUserId,
	UserId,
} from "../../../../../common/domain/value-objects";
import type { IExternalIdentityRepository, IUserRepository } from "../../ports/out/repositories";

export class GetConnectionsUseCase implements IGetConnectionsUseCase {
	constructor(
		private readonly externalIdentityRepository: IExternalIdentityRepository,
		private readonly userRepository: IUserRepository,
	) {}

	public async execute(userId: UserId): Promise<GetConnectionsUseCaseResult> {
		const passwordHash = await this.userRepository.findPasswordHashById(userId);

		const providerConnections: {
			[key in ToPrimitive<ExternalIdentityProvider>]: {
				provider: ExternalIdentityProvider;
				providerUserId: ExternalIdentityProviderUserId;
				linkedAt: Date;
			} | null;
		} = {
			discord: null,
			google: null,
		};

		const externalIdentities = await this.externalIdentityRepository.findByUserId(userId);

		for (const externalIdentity of externalIdentities) {
			providerConnections[externalIdentity.provider as ToPrimitive<ExternalIdentityProvider>] = {
				provider: externalIdentity.provider,
				providerUserId: externalIdentity.providerUserId,
				linkedAt: externalIdentity.linkedAt,
			};
		}

		return {
			password: passwordHash !== null,
			...providerConnections,
		};
	}
}
