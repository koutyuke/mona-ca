import { sessionExpiresSpan } from "../../../common/constants";
import { err } from "../../../common/utils";
import type { OAuthProvider } from "../../../domain/entities";
import type { IOAuthProviderGateway } from "../../../interface-adapter/gateway/oauth-provider";
import type { IOAuthAccountRepository } from "../../../interface-adapter/repositories/oauth-account";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { ISessionTokenService } from "../../services/session-token";
import type {
	IOAuthLoginCallbackUseCase,
	OAuthLoginCallbackUseCaseResult,
} from "./interfaces/oauth-login-callback.usecase.interface";

export class OAuthLoginCallbackUseCase implements IOAuthLoginCallbackUseCase {
	constructor(
		private readonly sessionTokenService: ISessionTokenService,
		private readonly oAuthProviderGateway: IOAuthProviderGateway,
		private readonly sessionRepository: ISessionRepository,
		private readonly oAuthAccountRepository: IOAuthAccountRepository,
		private readonly userRepository: IUserRepository,
	) {}

	public async execute(
		code: string,
		codeVerifier: string,
		provider: OAuthProvider,
	): Promise<OAuthLoginCallbackUseCaseResult> {
		const tokens = await this.oAuthProviderGateway.getTokens(code, codeVerifier);
		const accessToken = tokens.accessToken();

		const providerAccount = await this.oAuthProviderGateway.getAccountInfo(accessToken);

		await this.oAuthProviderGateway.revokeToken(accessToken);

		if (!providerAccount) {
			return err("FAILED_TO_GET_ACCOUNT_INFO");
		}

		const existingOAuthAccount = await this.oAuthAccountRepository.findByProviderAndProviderId(
			provider,
			providerAccount.id,
		);

		const sameEmailUser = await this.userRepository.findByEmail(providerAccount.email);

		if (!existingOAuthAccount) {
			if (sameEmailUser?.emailVerified) {
				return err("OAUTH_ACCOUNT_NOT_FOUND_BUT_LINKABLE");
			}
			return err("OAUTH_ACCOUNT_NOT_FOUND");
		}

		const sessionToken = this.sessionTokenService.generateSessionToken();
		const sessionId = this.sessionTokenService.hashSessionToken(sessionToken);

		const session = await this.sessionRepository.create({
			id: sessionId,
			userId: existingOAuthAccount.userId,
			expiresAt: new Date(Date.now() + sessionExpiresSpan.milliseconds()),
		});

		return {
			session,
			sessionToken,
		};
	}
}
