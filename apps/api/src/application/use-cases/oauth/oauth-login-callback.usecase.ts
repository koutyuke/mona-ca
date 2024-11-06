import { sessionExpiresSpan } from "@/common/constants";
import type { OAuthProvider } from "@/domain/oauth-account/provider";
import type { Session } from "@/domain/session";
import type { IOAuthProviderGateway } from "@/interface-adapter/gateway/oauth-provider";
import type { IOAuthAccountRepository } from "@/interface-adapter/repositories/oauth-account";
import type { ISessionRepository } from "@/interface-adapter/repositories/session";
import type { ISessionTokenService } from "@/services/session-token";
import type {
	IOAuthLoginCallbackUseCase,
	IOAuthLoginCallbackUseCaseResult,
} from "./interface/oauth-login-callback.usecase.interface";

export class OAuthLoginCallbackUseCase implements IOAuthLoginCallbackUseCase {
	constructor(
		private readonly sessionTokenService: ISessionTokenService,
		private readonly oAuthProviderGateway: IOAuthProviderGateway,
		private readonly sessionRepository: ISessionRepository,
		private readonly oAuthAccountRepository: IOAuthAccountRepository,
	) {}

	public async execute(
		code: string,
		codeVerifier: string,
		provider: OAuthProvider,
	): Promise<IOAuthLoginCallbackUseCaseResult> {
		const tokens = await this.oAuthProviderGateway.getTokens(code, codeVerifier);
		const accessToken = tokens.accessToken();

		const providerAccount = await this.oAuthProviderGateway.getAccountInfo(accessToken);

		if (!providerAccount) {
			throw new Error("FAILED_TO_GET_ACCOUNT_INFO");
		}

		const existingOAuthAccount = await this.oAuthAccountRepository.findByProviderAndProviderId(
			provider,
			providerAccount.id,
		);

		if (!existingOAuthAccount) {
			throw new Error("OAUTH_ACCOUNT_NOT_FOUND");
		}

		const sessionToken = this.sessionTokenService.generateSessionToken();

		const [session] = await Promise.all([
			this.createSession(sessionToken, existingOAuthAccount.userId),
			this.oAuthProviderGateway.revokeToken(accessToken),
		]);

		return {
			session,
			sessionToken,
		};
	}

	private async createSession(sessionToken: string, userId: string): Promise<Session> {
		const sessionId = this.sessionTokenService.hashSessionToken(sessionToken);

		const session = await this.sessionRepository.create({
			id: sessionId,
			userId,
			expiresAt: new Date(Date.now() + sessionExpiresSpan.milliseconds()),
		});

		return session;
	}
}