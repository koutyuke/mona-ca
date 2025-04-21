import { getMobileScheme, getWebBaseURL, validateRedirectURL } from "@mona-ca/core/utils";
import { err, isErr } from "../../../common/utils";
import { createSession } from "../../../domain/entities";
import { type OAuthProvider, newClientType, newOAuthProviderId, newSessionId } from "../../../domain/value-object";
import { type IOAuthProviderGateway, validateSignedState } from "../../../interface-adapter/gateway/oauth-provider";
import type { IOAuthAccountRepository } from "../../../interface-adapter/repositories/oauth-account";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { AppEnv } from "../../../modules/env";
import type { ISessionTokenService } from "../../services/session-token";
import type {
	IOAuthLoginCallbackUseCase,
	OAuthLoginCallbackUseCaseResult,
} from "./interfaces/oauth-login-callback.usecase.interface";
import { oauthStateSchema } from "./schema";

export class OAuthLoginCallbackUseCase implements IOAuthLoginCallbackUseCase {
	constructor(
		private readonly env: {
			APP_ENV: AppEnv["APP_ENV"];
			OAUTH_STATE_HMAC_SECRET: AppEnv["OAUTH_STATE_HMAC_SECRET"];
		},
		private readonly sessionTokenService: ISessionTokenService,
		private readonly oauthProviderGateway: IOAuthProviderGateway,
		private readonly sessionRepository: ISessionRepository,
		private readonly oauthAccountRepository: IOAuthAccountRepository,
		private readonly userRepository: IUserRepository,
	) {}

	public async execute(
		error: string | undefined,
		redirectURI: string,
		provider: OAuthProvider,
		signedState: string,
		code: string | undefined,
		codeVerifier: string,
	): Promise<OAuthLoginCallbackUseCaseResult> {
		const validatedState = validateSignedState(signedState, this.env.OAUTH_STATE_HMAC_SECRET, oauthStateSchema);

		if (isErr(validatedState)) {
			return err("INVALID_STATE");
		}

		const { client } = validatedState;

		const clientType = newClientType(client);

		const clientBaseURL = clientType === "web" ? getWebBaseURL(this.env.APP_ENV === "production") : getMobileScheme();

		const redirectToClientURL = validateRedirectURL(clientBaseURL, redirectURI ?? "/");

		if (!redirectToClientURL) {
			return err("INVALID_REDIRECT_URL");
		}

		if (error) {
			if (error === "access_denied") {
				return err("ACCESS_DENIED", { redirectURL: redirectToClientURL });
			}

			return err("PROVIDER_ERROR", { redirectURL: redirectToClientURL });
		}

		if (!code) {
			return err("CODE_NOT_FOUND");
		}

		const tokens = await this.oauthProviderGateway.getTokens(code, codeVerifier);
		const accessToken = tokens.accessToken();

		const providerAccount = await this.oauthProviderGateway.getAccountInfo(accessToken);

		await this.oauthProviderGateway.revokeToken(accessToken);

		if (!providerAccount) {
			return err("FAILED_TO_GET_ACCOUNT_INFO", { redirectURL: redirectToClientURL });
		}

		const existingOAuthAccount = await this.oauthAccountRepository.findByProviderAndProviderId(
			provider,
			newOAuthProviderId(providerAccount.id),
		);

		const sameEmailUser = await this.userRepository.findByEmail(providerAccount.email);

		if (!existingOAuthAccount) {
			if (sameEmailUser?.emailVerified) {
				return err("OAUTH_ACCOUNT_NOT_FOUND_BUT_LINKABLE", { redirectURL: redirectToClientURL });
			}
			return err("OAUTH_ACCOUNT_NOT_FOUND", { redirectURL: redirectToClientURL });
		}

		const sessionToken = this.sessionTokenService.generateSessionToken();
		const sessionId = newSessionId(this.sessionTokenService.hashSessionToken(sessionToken));
		const session = createSession({
			id: sessionId,
			userId: existingOAuthAccount.userId,
		});

		await this.sessionRepository.save(session);

		return {
			session,
			sessionToken,
			redirectURL: redirectToClientURL,
			clientType,
		};
	}
}
