import { err, generateRandomString, isErr } from "../../../common/utils";
import { createAccountAssociationSession, isExpiredAccountAssociationSession } from "../../../domain/entities";
import {
	type OAuthProvider,
	type OAuthProviderId,
	type UserId,
	newAccountAssociationSessionId,
} from "../../../domain/value-object";
import type { IAccountAssociationSessionRepository } from "../../../interface-adapter/repositories/account-association-session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { AppEnv } from "../../../modules/env";
import type { ISessionTokenService } from "../../services/session-token";
import type {
	AccountAssociationChallengeUseCaseResult,
	IAccountAssociationChallengeUseCase,
} from "./interfaces/account-association-challenge.interface.usecase";
import { validateAccountAssociationState } from "./utils";

export class AccountAssociationChallengeUseCase implements IAccountAssociationChallengeUseCase {
	constructor(
		private readonly env: {
			ACCOUNT_ASSOCIATION_STATE_HMAC_SECRET: AppEnv["ACCOUNT_ASSOCIATION_STATE_HMAC_SECRET"];
		},
		private readonly accountAssociationSessionTokenService: ISessionTokenService,
		private readonly accountAssociationSessionRepository: IAccountAssociationSessionRepository,
		private readonly userRepository: IUserRepository,
		private readonly userRateLimit: (userId: UserId) => Promise<void>,
	) {}

	public async execute(stateOrSessionToken: string): Promise<AccountAssociationChallengeUseCaseResult> {
		const isState = stateOrSessionToken.includes(".");

		let associationInfo: {
			userId: UserId;
			provider: OAuthProvider;
			providerId: OAuthProviderId;
		} | null = null;

		if (isState) {
			const result = validateAccountAssociationState(
				stateOrSessionToken,
				this.env.ACCOUNT_ASSOCIATION_STATE_HMAC_SECRET,
			);

			if (isErr(result)) {
				switch (result.code) {
					case "INVALID_SIGNED_STATE":
					case "FAILED_TO_DECODE_SIGNED_STATE":
						return err("INVALID_STATE_OR_SESSION_TOKEN");
					case "EXPIRED_STATE":
						return err("EXPIRED_STATE_OR_SESSION_TOKEN");
				}
			}

			const { userId, provider, providerId } = result;

			await this.userRateLimit(userId);

			associationInfo = { userId, provider, providerId };
		} else {
			const associationSessionId = newAccountAssociationSessionId(
				this.accountAssociationSessionTokenService.hashSessionToken(stateOrSessionToken),
			);
			const accountAssociationSession = await this.accountAssociationSessionRepository.findById(associationSessionId);

			if (!accountAssociationSession) {
				return err("INVALID_STATE_OR_SESSION_TOKEN");
			}

			if (isExpiredAccountAssociationSession(accountAssociationSession)) {
				return err("EXPIRED_STATE_OR_SESSION_TOKEN");
			}

			await this.userRateLimit(accountAssociationSession.userId);

			await this.accountAssociationSessionRepository.deleteByUserId(accountAssociationSession.userId);

			associationInfo = {
				userId: accountAssociationSession.userId,
				provider: accountAssociationSession.provider,
				providerId: accountAssociationSession.providerId,
			};
		}

		const user = await this.userRepository.findById(associationInfo.userId);

		if (!user) {
			return err("USER_NOT_FOUND");
		}

		const associationSessionToken = this.accountAssociationSessionTokenService.generateSessionToken();
		const associationSessionId = newAccountAssociationSessionId(
			this.accountAssociationSessionTokenService.hashSessionToken(associationSessionToken),
		);
		const code = generateRandomString(8, {
			number: true,
		});

		const accountAssociationSession = createAccountAssociationSession({
			id: associationSessionId,
			userId: associationInfo.userId,
			code,
			email: user.email,
			provider: associationInfo.provider,
			providerId: associationInfo.providerId,
		});

		await this.accountAssociationSessionRepository.save(accountAssociationSession);

		return {
			accountAssociationSessionToken: associationSessionToken,
			accountAssociationSession,
		};
	}
}
