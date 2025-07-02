import { err, generateRandomString, ulid } from "../../../common/utils";
import {
	type AccountAssociationSession,
	createAccountAssociationSession,
	isExpiredAccountAssociationSession,
} from "../../../domain/entities";
import { newAccountAssociationSessionId } from "../../../domain/value-object";
import type { IAccountAssociationSessionRepository } from "../../../interface-adapter/repositories/account-association-session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import { type ISessionSecretService, createSessionToken } from "../../services/session";
import type {
	AccountAssociationChallengeUseCaseResult,
	IAccountAssociationChallengeUseCase,
} from "./interfaces/account-association-challenge.interface.usecase";

export class AccountAssociationChallengeUseCase implements IAccountAssociationChallengeUseCase {
	constructor(
		private readonly accountAssociationSessionSecretService: ISessionSecretService,
		private readonly accountAssociationSessionRepository: IAccountAssociationSessionRepository,
		private readonly userRepository: IUserRepository,
	) {}

	public async execute(
		accountAssociationSession: AccountAssociationSession,
	): Promise<AccountAssociationChallengeUseCaseResult> {
		if (isExpiredAccountAssociationSession(accountAssociationSession)) {
			return err("EXPIRED_SESSION_TOKEN");
		}

		await this.accountAssociationSessionRepository.deleteByUserId(accountAssociationSession.userId);

		const user = await this.userRepository.findById(accountAssociationSession.userId);

		if (!user) {
			return err("USER_NOT_FOUND");
		}

		if (!user.emailVerified) {
			return err("EMAIL_NOT_VERIFIED");
		}

		if (user.email !== accountAssociationSession.email) {
			return err("INVALID_EMAIL");
		}

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
