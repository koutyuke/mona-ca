import { ulid } from "../../../common/utils";
import { type AccountAssociationSession, type User, createAccountAssociationSession } from "../../../domain/entities";
import {
	type AccountAssociationSessionToken,
	type ExternalIdentityProvider,
	type ExternalIdentityProviderUserId,
	type UserId,
	formatSessionToken,
	newAccountAssociationSessionId,
} from "../../../domain/value-object";
import type { AccountAssociationChallengeUseCaseResult, IAccountAssociationChallengeUseCase } from "../../ports/in";
import type { IAccountAssociationSessionRepository } from "../../ports/out/repositories";
import type { IRandomGenerator, ISessionSecretHasher } from "../../ports/out/system";

// this use case will be called after the validate account association session use case.
// so we don't need to check the expired account association session.
export class AccountAssociationChallengeUseCase implements IAccountAssociationChallengeUseCase {
	constructor(
		private readonly accountAssociationSessionRepository: IAccountAssociationSessionRepository,
		private readonly sessionSecretHasher: ISessionSecretHasher,
		private readonly randomGenerator: IRandomGenerator,
	) {}

	public async execute(
		user: User,
		oldAccountAssociationSession: AccountAssociationSession,
	): Promise<AccountAssociationChallengeUseCaseResult> {
		await this.accountAssociationSessionRepository.deleteByUserId(oldAccountAssociationSession.userId);

		const { accountAssociationSession, accountAssociationSessionToken } = this.createAccountAssociationSession(
			user.id,
			user.email,
			oldAccountAssociationSession.provider,
			oldAccountAssociationSession.providerUserId,
		);

		await this.accountAssociationSessionRepository.save(accountAssociationSession);

		return {
			accountAssociationSession,
			accountAssociationSessionToken,
		};
	}

	private createAccountAssociationSession(
		userId: UserId,
		email: string,
		provider: ExternalIdentityProvider,
		providerUserId: ExternalIdentityProviderUserId,
	): {
		accountAssociationSession: AccountAssociationSession;
		accountAssociationSessionToken: AccountAssociationSessionToken;
	} {
		const accountAssociationSessionSecret = this.sessionSecretHasher.generate();
		const accountAssociationSessionSecretHash = this.sessionSecretHasher.hash(accountAssociationSessionSecret);
		const accountAssociationSessionId = newAccountAssociationSessionId(ulid());
		const accountAssociationSessionToken = formatSessionToken(
			accountAssociationSessionId,
			accountAssociationSessionSecret,
		);

		const code = this.randomGenerator.string(8, {
			digits: true,
		});

		const accountAssociationSession = createAccountAssociationSession({
			id: accountAssociationSessionId,
			userId,
			code,
			email,
			provider,
			providerUserId,
			secretHash: accountAssociationSessionSecretHash,
		});
		return { accountAssociationSession, accountAssociationSessionToken };
	}
}
