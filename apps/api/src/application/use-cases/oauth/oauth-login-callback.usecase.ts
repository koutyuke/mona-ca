import { getMobileScheme, getWebBaseURL, validateRedirectURL } from "@mona-ca/core/utils";
import { err, isErr, ulid } from "../../../common/utils";
import { createAccountAssociationSession, createSession } from "../../../domain/entities";
import {
	type OAuthProvider,
	newAccountAssociationSessionId,
	newClientType,
	newOAuthProviderId,
	newSessionId,
} from "../../../domain/value-object";
import { type IOAuthProviderGateway, validateSignedState } from "../../../interface-adapter/gateway/oauth-provider";
import type { IAccountAssociationSessionRepository } from "../../../interface-adapter/repositories/account-association-session";
import type { IOAuthAccountRepository } from "../../../interface-adapter/repositories/oauth-account";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { AppEnv } from "../../../modules/env";
import { type ISessionSecretService, createSessionToken } from "../../services/session";
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
		private readonly sessionSecretService: ISessionSecretService,
		private readonly oauthProviderGateway: IOAuthProviderGateway,
		private readonly sessionRepository: ISessionRepository,
		private readonly oauthAccountRepository: IOAuthAccountRepository,
		private readonly userRepository: IUserRepository,
		private readonly accountAssociationSessionRepository: IAccountAssociationSessionRepository,
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
			return err("INVALID_OAUTH_STATE");
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
				return err("OAUTH_ACCESS_DENIED", { redirectURL: redirectToClientURL });
			}

			return err("OAUTH_PROVIDER_ERROR", { redirectURL: redirectToClientURL });
		}

		if (!code) {
			return err("OAUTH_CREDENTIALS_INVALID");
		}

		const tokensResult = await this.oauthProviderGateway.getTokens(code, codeVerifier);

		if (isErr(tokensResult)) {
			switch (tokensResult.code) {
				case "OAUTH_CREDENTIALS_INVALID":
					return err("OAUTH_CREDENTIALS_INVALID");
				case "FAILED_TO_FETCH_OAUTH_TOKENS":
					return err("FAILED_TO_FETCH_OAUTH_ACCOUNT", { redirectURL: redirectToClientURL });
				default:
					return err("FAILED_TO_FETCH_OAUTH_ACCOUNT", { redirectURL: redirectToClientURL });
			}
		}

		const accountInfoResult = await this.oauthProviderGateway.getAccountInfo(tokensResult);

		await this.oauthProviderGateway.revokeToken(tokensResult);

		if (isErr(accountInfoResult)) {
			switch (accountInfoResult.code) {
				case "OAUTH_ACCESS_TOKEN_INVALID":
					return err("FAILED_TO_FETCH_OAUTH_ACCOUNT", { redirectURL: redirectToClientURL });
				case "FAILED_TO_GET_ACCOUNT_INFO":
					return err("FAILED_TO_FETCH_OAUTH_ACCOUNT", { redirectURL: redirectToClientURL });
				case "OAUTH_ACCOUNT_EMAIL_NOT_FOUND":
					return err("OAUTH_ACCOUNT_EMAIL_NOT_FOUND", { redirectURL: redirectToClientURL });
				case "OAUTH_ACCOUNT_INFO_INVALID":
					return err("OAUTH_ACCOUNT_INFO_INVALID", { redirectURL: redirectToClientURL });
				default:
					return err("FAILED_TO_FETCH_OAUTH_ACCOUNT", { redirectURL: redirectToClientURL });
			}
		}

		const providerAccount = accountInfoResult;

		const existingOAuthAccount = await this.oauthAccountRepository.findByProviderAndProviderId(
			provider,
			newOAuthProviderId(providerAccount.id),
		);

		const existingUserForSameEmail = await this.userRepository.findByEmail(providerAccount.email);

		if (!existingOAuthAccount) {
			if (existingUserForSameEmail?.emailVerified) {
				const accountAssociationSessionSecret = this.sessionSecretService.generateSessionSecret();
				const accountAssociationSessionSecretHash = this.sessionSecretService.hashSessionSecret(
					accountAssociationSessionSecret,
				);
				const accountAssociationSessionId = newAccountAssociationSessionId(ulid());
				const accountAssociationSessionToken = createSessionToken(
					accountAssociationSessionId,
					accountAssociationSessionSecret,
				);
				const accountAssociationSession = createAccountAssociationSession({
					id: accountAssociationSessionId,
					userId: existingUserForSameEmail.id,
					code: null,
					secretHash: accountAssociationSessionSecretHash,
					email: existingUserForSameEmail.email,
					provider,
					providerId: newOAuthProviderId(providerAccount.id),
				});

				await this.accountAssociationSessionRepository.deleteByUserId(existingUserForSameEmail.id);
				await this.accountAssociationSessionRepository.save(accountAssociationSession);

				return err("OAUTH_ACCOUNT_NOT_FOUND_BUT_LINKABLE", {
					redirectURL: redirectToClientURL,
					clientType,
					accountAssociationSessionToken,
					accountAssociationSession,
				});
			}
			return err("OAUTH_ACCOUNT_NOT_FOUND", { redirectURL: redirectToClientURL });
		}

		const sessionSecret = this.sessionSecretService.generateSessionSecret();
		const sessionSecretHash = this.sessionSecretService.hashSessionSecret(sessionSecret);
		const sessionId = newSessionId(ulid());
		const sessionToken = createSessionToken(sessionId, sessionSecret);
		const session = createSession({
			id: sessionId,
			userId: existingOAuthAccount.userId,
			secretHash: sessionSecretHash,
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
