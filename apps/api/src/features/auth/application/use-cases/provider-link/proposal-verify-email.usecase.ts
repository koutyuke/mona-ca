import { err, ok } from "@mona-ca/core/result";
import { ulid } from "../../../../../core/lib/id";
import { timingSafeStringEqual } from "../../../../../core/lib/security";
import { createProviderAccount } from "../../../domain/entities/provider-account";
import { createSession } from "../../../domain/entities/session";
import { newSessionId } from "../../../domain/value-objects/ids";
import { encodeToken } from "../../../domain/value-objects/tokens";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { ITokenSecretService } from "../../../../../core/ports/system";
import type { ProviderLinkProposal } from "../../../domain/entities/provider-link-proposal";
import type { Session } from "../../../domain/entities/session";
import { type UserCredentials, updateUserCredentials } from "../../../domain/entities/user-credentials";
import type { SessionToken } from "../../../domain/value-objects/tokens";
import type {
	IProviderLinkProposalVerifyEmailUseCase,
	ProviderLinkProposalVerifyEmailUseCaseResult,
} from "../../ports/in/provider-link/proposal-verify-email.usecase.interface";
import type { IAuthUserRepository } from "../../ports/out/repositories/auth-user.repository.interface";
import type { IProviderAccountRepository } from "../../ports/out/repositories/provider-account.repository.interface";
import type { IProviderLinkProposalRepository } from "../../ports/out/repositories/provider-link-proposal.repository.interface";
import type { ISessionRepository } from "../../ports/out/repositories/session.repository.interface";

// this use case will be called after the validate provider link proposal use case.
// so we don't need to check the expired provider link proposal.
export class ProviderLinkProposalVerifyEmailUseCase implements IProviderLinkProposalVerifyEmailUseCase {
	constructor(
		// repositories
		private readonly providerLinkProposalRepository: IProviderLinkProposalRepository,
		private readonly authUserRepository: IAuthUserRepository,
		private readonly providerAccountRepository: IProviderAccountRepository,
		private readonly sessionRepository: ISessionRepository,
		// infra
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	public async execute(
		code: string,
		userCredentials: UserCredentials,
		providerLinkProposal: ProviderLinkProposal,
	): Promise<ProviderLinkProposalVerifyEmailUseCaseResult> {
		if (providerLinkProposal.code === null) {
			return err("INVALID_CODE");
		}

		if (!timingSafeStringEqual(providerLinkProposal.code, code)) {
			return err("INVALID_CODE");
		}

		await this.providerLinkProposalRepository.deleteById(providerLinkProposal.id);

		const [existingProviderAccount, currentUserProviderAccount] = await Promise.all([
			this.providerAccountRepository.findByProviderAndProviderUserId(
				providerLinkProposal.provider,
				providerLinkProposal.providerUserId,
			),
			this.providerAccountRepository.findByUserIdAndProvider(
				providerLinkProposal.userId,
				providerLinkProposal.provider,
			),
		]);

		if (currentUserProviderAccount) {
			return err("PROVIDER_ALREADY_LINKED");
		}

		if (existingProviderAccount) {
			return err("ACCOUNT_LINKED_ELSEWHERE");
		}

		const updatedUserCredentials = updateUserCredentials(userCredentials, {
			emailVerified: true,
		});

		const { session, sessionToken } = this.createSession(userCredentials.id);

		const providerAccount = createProviderAccount({
			provider: providerLinkProposal.provider,
			providerUserId: providerLinkProposal.providerUserId,
			userId: userCredentials.id,
		});

		await Promise.all([
			this.providerAccountRepository.save(providerAccount),
			this.sessionRepository.save(session),
			this.authUserRepository.update(updatedUserCredentials),
		]);

		return ok({
			session,
			sessionToken,
		});
	}

	private createSession(userId: UserId): {
		session: Session;
		sessionToken: SessionToken;
	} {
		const id = newSessionId(ulid());
		const secret = this.tokenSecretService.generateSecret();
		const secretHash = this.tokenSecretService.hash(secret);

		const session = createSession({
			id,
			userId,
			secretHash,
		});
		const sessionToken = encodeToken(id, secret);
		return { session, sessionToken };
	}
}
