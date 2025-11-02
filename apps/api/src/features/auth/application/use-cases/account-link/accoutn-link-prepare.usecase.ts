import { ok } from "@mona-ca/core/utils";
import type { UserId } from "../../../../../core/domain/value-objects";
import { ulid } from "../../../../../core/lib/id";
import type { ISessionSecretHasher } from "../../../../../core/ports/system";
import { type AccountLinkSession, createAccountLinkSession } from "../../../domain/entities/account-link-session";
import { newAccountLinkSessionId } from "../../../domain/value-objects/ids";
import { type AccountLinkSessionToken, formatAnySessionToken } from "../../../domain/value-objects/session-token";
import type {
	AccountLinkPrepareUseCaseResult,
	IAccountLinkPrepareUseCase,
} from "../../contracts/account-link/account-link-prepare.usecase.interface";
import type { IAccountLinkSessionRepository } from "../../ports/repositories/account-link-session.repository.interface";

export class AccountLinkPrepareUseCase implements IAccountLinkPrepareUseCase {
	constructor(
		private readonly accountLinkSessionRepository: IAccountLinkSessionRepository,
		private readonly sessionSecretHasher: ISessionSecretHasher,
	) {}

	public async execute(userId: UserId): Promise<AccountLinkPrepareUseCaseResult> {
		await this.accountLinkSessionRepository.deleteByUserId(userId);
		const { accountLinkSession, accountLinkSessionToken } = this.createAccountLinkSession(userId);
		await this.accountLinkSessionRepository.save(accountLinkSession);
		return ok({
			accountLinkSession,
			accountLinkSessionToken,
		});
	}

	private createAccountLinkSession(userId: UserId): {
		accountLinkSession: AccountLinkSession;
		accountLinkSessionToken: AccountLinkSessionToken;
	} {
		const accountLinkSessionId = newAccountLinkSessionId(ulid());
		const accountLinkSessionSecret = this.sessionSecretHasher.generate();
		const accountLinkSessionSecretHash = this.sessionSecretHasher.hash(accountLinkSessionSecret);
		const accountLinkSession = createAccountLinkSession({
			id: accountLinkSessionId,
			userId,
			secretHash: accountLinkSessionSecretHash,
		});
		const accountLinkSessionToken = formatAnySessionToken(accountLinkSessionId, accountLinkSessionSecret);
		return { accountLinkSession, accountLinkSessionToken };
	}
}
