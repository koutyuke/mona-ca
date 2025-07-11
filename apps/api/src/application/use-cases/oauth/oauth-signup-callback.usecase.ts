import { getMobileScheme, getWebBaseURL, validateRedirectURL } from "@mona-ca/core/utils";
import { err, isErr, ulid } from "../../../common/utils";
import {
	DEFAULT_USER_GENDER,
	createAccountAssociationSession,
	createOAuthAccount,
	createSession,
	createUser,
} from "../../../domain/entities";
import {
	type OAuthProvider,
	newAccountAssociationSessionId,
	newClientType,
	newGender,
	newOAuthProviderId,
	newSessionId,
	newUserId,
} from "../../../domain/value-object";
import { type IOAuthProviderGateway, validateSignedState } from "../../../interface-adapter/gateway/oauth-provider";
import type { IAccountAssociationSessionRepository } from "../../../interface-adapter/repositories/account-association-session";
import type { IOAuthAccountRepository } from "../../../interface-adapter/repositories/oauth-account";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { AppEnv } from "../../../modules/env";
import { type ISessionSecretService, createSessionToken } from "../../services/session";
import type {
	IOAuthSignupCallbackUseCase,
	OAuthSignupCallbackUseCaseResult,
} from "./interfaces/oauth-signup-callback.usecase.interface";
import { oauthStateSchema } from "./schema";

export class OAuthSignupCallbackUseCase implements IOAuthSignupCallbackUseCase {
	constructor(
		private readonly env: {
			APP_ENV: AppEnv["APP_ENV"];
			OAUTH_STATE_HMAC_SECRET: AppEnv["OAUTH_STATE_HMAC_SECRET"];
		},
		private readonly sessionSecretService: ISessionSecretService,
		private readonly accountAssociationSessionSecretService: ISessionSecretService,
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
	): Promise<OAuthSignupCallbackUseCaseResult> {
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
				case "OAUTH_ACCOUNT_EMAIL_NOT_FOUND":
					return err("OAUTH_ACCOUNT_EMAIL_NOT_FOUND", { redirectURL: redirectToClientURL });
				case "OAUTH_ACCOUNT_INFO_INVALID":
					return err("OAUTH_ACCOUNT_INFO_INVALID", { redirectURL: redirectToClientURL });
				case "OAUTH_ACCESS_TOKEN_INVALID":
					return err("FAILED_TO_FETCH_OAUTH_ACCOUNT", { redirectURL: redirectToClientURL });
				case "FAILED_TO_GET_ACCOUNT_INFO":
					return err("FAILED_TO_FETCH_OAUTH_ACCOUNT", { redirectURL: redirectToClientURL });
				default:
					return err("FAILED_TO_FETCH_OAUTH_ACCOUNT", { redirectURL: redirectToClientURL });
			}
		}

		const providerAccount = accountInfoResult;

		const providerId = newOAuthProviderId(providerAccount.id);

		const existingOAuthAccount = await this.oauthAccountRepository.findByProviderAndProviderId(provider, providerId);

		// check pre-register user
		const existingUser = existingOAuthAccount
			? await this.userRepository.findById(existingOAuthAccount.userId)
			: await this.userRepository.findByEmail(providerAccount.email);

		if (existingUser) {
			if (existingUser.emailVerified) {
				// if emailVerified is true, this user is already registered user

				if (existingOAuthAccount) {
					return err("OAUTH_ACCOUNT_ALREADY_REGISTERED", { redirectURL: redirectToClientURL });
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
				const accountAssociationSession = createAccountAssociationSession({
					id: accountAssociationSessionId,
					userId: existingUser.id,
					code: null,
					secretHash: accountAssociationSessionSecretHash,
					email: existingUser.email,
					provider,
					providerId,
				});

				await this.accountAssociationSessionRepository.deleteByUserId(existingUser.id);
				await this.accountAssociationSessionRepository.save(accountAssociationSession);

				return err("OAUTH_EMAIL_ALREADY_REGISTERED_BUT_LINKABLE", {
					redirectURL: redirectToClientURL,
					clientType,
					accountAssociationSessionToken,
					accountAssociationSession,
				});
			}
			await this.userRepository.deleteById(existingUser.id);
		} else if (existingOAuthAccount) {
			await this.oauthAccountRepository.deleteByProviderAndProviderId(provider, providerId);
		}

		const user = createUser({
			id: newUserId(ulid()),
			name: providerAccount.name,
			email: providerAccount.email,
			emailVerified: providerAccount.emailVerified, // if emailVerified is false, this user is pre-register user
			iconUrl: providerAccount.iconURL,
			gender: newGender(DEFAULT_USER_GENDER),
		});

		await this.userRepository.save(user, { passwordHash: null });

		const sessionSecret = this.sessionSecretService.generateSessionSecret();
		const sessionSecretHash = this.sessionSecretService.hashSessionSecret(sessionSecret);
		const sessionId = newSessionId(ulid());
		const sessionToken = createSessionToken(sessionId, sessionSecret);
		const session = createSession({
			id: sessionId,
			userId: user.id,
			secretHash: sessionSecretHash,
		});

		const oauthAccount = createOAuthAccount({
			provider,
			providerId,
			userId: user.id,
		});

		await Promise.all([this.sessionRepository.save(session), this.oauthAccountRepository.save(oauthAccount)]);

		return {
			session,
			sessionToken,
			redirectURL: redirectToClientURL,
			clientType,
		};
	}
}
