import { err, ok } from "@mona-ca/core/result";
import { isExpiredAccountLinkRequest } from "../../../domain/entities/account-link-request";
import { decodeToken } from "../../../domain/value-objects/tokens";

import type { ITokenSecretService } from "../../../../../core/ports/system";
import type { AccountLinkRequestToken } from "../../../domain/value-objects/tokens";
import type {
	AccountLinkValidateRequestUseCaseResult,
	IAccountLinkValidateRequestUseCase,
} from "../../ports/in/account-link/validate-request.usecase.interface";
import type { IAccountLinkRequestRepository } from "../../ports/out/repositories/account-link-request.repository.interface";
import type { IAuthUserRepository } from "../../ports/out/repositories/auth-user.repository.interface";

export class AccountLinkValidateRequestUseCase implements IAccountLinkValidateRequestUseCase {
	constructor(
		// repositories
		private readonly authUserRepository: IAuthUserRepository,
		private readonly accountLinkRequestRepository: IAccountLinkRequestRepository,
		// infra
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	public async execute(
		accountLinkRequestToken: AccountLinkRequestToken,
	): Promise<AccountLinkValidateRequestUseCaseResult> {
		const accountLinkRequestIdAndSecret = decodeToken(accountLinkRequestToken);

		if (!accountLinkRequestIdAndSecret) {
			return err("INVALID_ACCOUNT_LINK_REQUEST");
		}

		const { id: accountLinkRequestId, secret: accountLinkRequestSecret } = accountLinkRequestIdAndSecret;

		const accountLinkRequest = await this.accountLinkRequestRepository.findById(accountLinkRequestId);

		if (!accountLinkRequest) {
			return err("INVALID_ACCOUNT_LINK_REQUEST");
		}

		if (!this.tokenSecretService.verify(accountLinkRequestSecret, accountLinkRequest.secretHash)) {
			return err("INVALID_ACCOUNT_LINK_REQUEST");
		}

		if (isExpiredAccountLinkRequest(accountLinkRequest)) {
			await this.accountLinkRequestRepository.deleteById(accountLinkRequestId);
			return err("INVALID_ACCOUNT_LINK_REQUEST");
		}

		const userCredentials = await this.authUserRepository.findById(accountLinkRequest.userId);

		if (!userCredentials || userCredentials.email !== accountLinkRequest.email) {
			await this.accountLinkRequestRepository.deleteById(accountLinkRequestId);
			return err("INVALID_ACCOUNT_LINK_REQUEST");
		}

		return ok({ accountLinkRequest, userCredentials });
	}
}
