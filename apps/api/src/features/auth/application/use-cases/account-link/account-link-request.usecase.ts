import { err, getMobileScheme, getWebBaseURL, ok, validateRedirectURL } from "@mona-ca/core/utils";
import { generateCodeVerifier } from "arctic";

import type { ClientType } from "../../../../../core/domain/value-objects";
import type { ISessionSecretHasher } from "../../../../../core/ports/system";
import { isExpiredAccountLinkSession } from "../../../domain/entities/account-link-session";
import type { ExternalIdentityProvider } from "../../../domain/value-objects/external-identity";
import { type AccountLinkSessionToken, parseAnySessionToken } from "../../../domain/value-objects/session-token";
import type {
	AccountLinkRequestUseCaseResult,
	IAccountLinkRequestUseCase,
} from "../../contracts/account-link/account-link-request.usecase.interface";
import type { IOAuthProviderGateway } from "../../ports/gateways/oauth-provider.gateway.interface";
import type { IHmacOAuthStateSigner } from "../../ports/infra/hmac-oauth-state-signer.interface";
import type { IAccountLinkSessionRepository } from "../../ports/repositories/account-link-session.repository.interface";
import type { accountLinkStateSchema } from "./schema";

export class AccountLinkRequestUseCase implements IAccountLinkRequestUseCase {
	constructor(
		private readonly googleOAuthGateway: IOAuthProviderGateway,
		private readonly discordOAuthGateway: IOAuthProviderGateway,
		private readonly accountLinkOAuthStateSigner: IHmacOAuthStateSigner<typeof accountLinkStateSchema>,
		private readonly accountLinkSessionRepository: IAccountLinkSessionRepository,
		private readonly sessionSecretHasher: ISessionSecretHasher,
	) {}

	public async execute(
		production: boolean,
		clientType: ClientType,
		provider: ExternalIdentityProvider,
		queryRedirectURI: string,
		accountLinkSessionToken: AccountLinkSessionToken,
	): Promise<AccountLinkRequestUseCaseResult> {
		const clientBaseURL = clientType === "web" ? getWebBaseURL(production) : getMobileScheme();
		const oauthProviderGateway = provider === "google" ? this.googleOAuthGateway : this.discordOAuthGateway;

		const redirectToClientURL = validateRedirectURL(clientBaseURL, queryRedirectURI ?? "/");

		if (!redirectToClientURL) {
			return err("INVALID_REDIRECT_URI");
		}

		const idAndSecret = parseAnySessionToken(accountLinkSessionToken);
		if (!idAndSecret) {
			return err("ACCOUNT_LINK_SESSION_INVALID");
		}

		const { id: accountLinkSessionId, secret: accountLinkSessionSecret } = idAndSecret;

		const accountLinkSession = await this.accountLinkSessionRepository.findById(accountLinkSessionId);

		if (!accountLinkSession) {
			return err("ACCOUNT_LINK_SESSION_INVALID");
		}
		if (isExpiredAccountLinkSession(accountLinkSession)) {
			await this.accountLinkSessionRepository.deleteById(accountLinkSessionId);
			return err("ACCOUNT_LINK_SESSION_EXPIRED");
		}
		if (!this.sessionSecretHasher.verify(accountLinkSessionSecret, accountLinkSession.secretHash)) {
			await this.accountLinkSessionRepository.deleteById(accountLinkSessionId);
			return err("ACCOUNT_LINK_SESSION_INVALID");
		}

		const state = this.accountLinkOAuthStateSigner.generate({
			client: clientType,
			uid: accountLinkSession.userId,
			sid: accountLinkSessionId,
		});
		const codeVerifier = generateCodeVerifier();
		const redirectToProviderURL = oauthProviderGateway.createAuthorizationURL(state, codeVerifier);

		return ok({
			state,
			codeVerifier,
			redirectToClientURL,
			redirectToProviderURL,
		});
	}
}
