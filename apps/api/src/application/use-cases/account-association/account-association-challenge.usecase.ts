import { generateRandomString, ulid } from "../../../common/utils";
import { type AccountAssociationSession, type User, createAccountAssociationSession } from "../../../domain/entities";
import { newAccountAssociationSessionId } from "../../../domain/value-object";
import type { IAccountAssociationSessionRepository } from "../../../interface-adapter/repositories/account-association-session";
import { type ISessionSecretService, createSessionToken } from "../../services/session";
import type {
	AccountAssociationChallengeUseCaseResult,
	IAccountAssociationChallengeUseCase,
} from "./interfaces/account-association-challenge.interface.usecase";

// this use case will be called after the validate account association session use case.
// so we don't need to check the expired account association session.
export class AccountAssociationChallengeUseCase implements IAccountAssociationChallengeUseCase {
	constructor(
		private readonly accountAssociationSessionSecretService: ISessionSecretService,
		private readonly accountAssociationSessionRepository: IAccountAssociationSessionRepository,
	) {}

	public async execute(
		user: User,
		accountAssociationSession: AccountAssociationSession,
	): Promise<AccountAssociationChallengeUseCaseResult> {
		await this.accountAssociationSessionRepository.deleteByUserId(accountAssociationSession.userId);

		const accountAssociationSessionSecret = this.accountAssociationSessionSecretService.generateSessionSecret();
		const accountAssociationSessionSecretHash = this.accountAssociationSessionSecretService.hashSessionSecret(
			accountAssociationSessionSecret,
		);
		const accountAssociationSessionId = newAccountAssociationSessionId(ulid());
		const accountAssociationSessionToken = createSessionToken(
			accountAssociationSessionId,
			accountAssociationSessionSecret,
		);

		const code = generateRandomString(8, {
			number: true,
		});

		const newAccountAssociationSession = createAccountAssociationSession({
			id: accountAssociationSessionId,
			userId: user.id,
			code,
			email: user.email,
			provider: accountAssociationSession.provider,
			providerId: accountAssociationSession.providerId,
			secretHash: accountAssociationSessionSecretHash,
		});

		await this.accountAssociationSessionRepository.save(newAccountAssociationSession);

		return {
			accountAssociationSessionToken,
			accountAssociationSession: newAccountAssociationSession,
		};
	}
}
