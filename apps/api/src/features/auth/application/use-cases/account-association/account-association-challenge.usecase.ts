import { ulid } from "../../../../../core/lib/id";
import { createAccountAssociationSession } from "../../../domain/entities/account-association-session";
import { newAccountAssociationSessionId } from "../../../domain/value-objects/ids";
import { formatAnySessionToken } from "../../../domain/value-objects/session-token";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { IEmailGateway } from "../../../../../core/ports/gateways";
import type { IRandomGenerator, ISessionSecretHasher } from "../../../../../core/ports/system";
import type { AccountAssociationSession } from "../../../domain/entities/account-association-session";
import type {
	ExternalIdentityProvider,
	ExternalIdentityProviderUserId,
} from "../../../domain/value-objects/external-identity";
import type { AccountAssociationSessionToken } from "../../../domain/value-objects/session-token";
import type {
	AccountAssociationChallengeUseCaseResult,
	IAccountAssociationChallengeUseCase,
} from "../../contracts/account-association/account-association-challenge.usecase.interface";
import type { IAccountAssociationSessionRepository } from "../../ports/repositories/account-association-session.repository.interface";

// this use case will be called after the validate account association session use case.
// so we don't need to check the expired account association session.
export class AccountAssociationChallengeUseCase implements IAccountAssociationChallengeUseCase {
	constructor(
		private readonly accountAssociationSessionRepository: IAccountAssociationSessionRepository,
		private readonly sessionSecretHasher: ISessionSecretHasher,
		private readonly randomGenerator: IRandomGenerator,
		private readonly emailGateway: IEmailGateway,
	) {}

	public async execute(
		oldAccountAssociationSession: AccountAssociationSession,
	): Promise<AccountAssociationChallengeUseCaseResult> {
		await this.accountAssociationSessionRepository.deleteByUserId(oldAccountAssociationSession.userId);

		const { accountAssociationSession, accountAssociationSessionToken } = this.createAccountAssociationSession(
			oldAccountAssociationSession.userId,
			oldAccountAssociationSession.email,
			oldAccountAssociationSession.provider,
			oldAccountAssociationSession.providerUserId,
		);

		await this.accountAssociationSessionRepository.save(accountAssociationSession);

		await this.emailGateway.sendVerificationEmail(
			accountAssociationSession.email,
			accountAssociationSession.code ?? "",
		);

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
		const accountAssociationSessionToken = formatAnySessionToken(
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
