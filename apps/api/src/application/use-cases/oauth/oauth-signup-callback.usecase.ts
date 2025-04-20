import { getMobileScheme, getWebBaseURL, validateRedirectURL } from "@mona-ca/core/utils";
import { DEFAULT_USER_GENDER } from "../../../common/constants";
import { err, isErr, ulid } from "../../../common/utils";
import { createOAuthAccount, createSession, createUser } from "../../../domain/entities";
import {
	type OAuthProvider,
	newClientType,
	newGender,
	newOAuthProviderId,
	newSessionId,
	newUserId,
} from "../../../domain/value-object";
import { type IOAuthProviderGateway, validateSignedState } from "../../../interface-adapter/gateway/oauth-provider";
import type { IOAuthAccountRepository } from "../../../interface-adapter/repositories/oauth-account";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { AppEnv } from "../../../modules/env";
import { oauthStateSchema } from "../../schemas";
import type { ISessionTokenService } from "../../services/session-token";
import type {
	IOAuthSignupCallbackUseCase,
	OAuthSignupCallbackUseCaseResult,
} from "./interfaces/oauth-signup-callback.usecase.interface";

export class OAuthSignupCallbackUseCase implements IOAuthSignupCallbackUseCase {
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
	): Promise<OAuthSignupCallbackUseCaseResult> {
		const validatedState = validateSignedState(signedState, this.env.OAUTH_STATE_HMAC_SECRET, oauthStateSchema);

		if (isErr(validatedState)) {
			return err("INVALID_STATE");
		}

		const { clientType: _clientType } = validatedState;

		const clientType = newClientType(_clientType);

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
					return err("ACCOUNT_IS_ALREADY_USED", { redirectURL: redirectToClientURL });
				}

				return err("EMAIL_ALREADY_EXISTS_BUT_LINKABLE", { redirectURL: redirectToClientURL });
			}
			await this.userRepository.delete(existingUser.id);
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

		const sessionToken = this.sessionTokenService.generateSessionToken();
		const sessionId = newSessionId(this.sessionTokenService.hashSessionToken(sessionToken));
		const session = createSession({
			id: sessionId,
			userId: user.id,
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
