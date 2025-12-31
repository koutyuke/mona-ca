import { getMobileScheme, getWebBaseURL, validateRedirectURL } from "@mona-ca/core/http";
import { err, ok } from "@mona-ca/core/result";
import { match } from "ts-pattern";
import {
	isMobilePlatform,
	isWebPlatform,
	newClientPlatform,
	newGender,
	newUserId,
} from "../../../../../core/domain/value-objects";
import { ulid } from "../../../../../core/lib/id";
import { createAccountLinkRequest } from "../../../domain/entities/account-link-request";
import { createProviderAccount } from "../../../domain/entities/provider-account";
import { createSession } from "../../../domain/entities/session";
import { createUserRegistration, DEFAULT_USER_GENDER } from "../../../domain/entities/user-registration";
import {
	isDiscordProvider,
	isGoogleProvider,
	newIdentityProvidersUserId,
} from "../../../domain/value-objects/identity-providers";
import { newAccountLinkRequestId, newSessionId } from "../../../domain/value-objects/ids";
import { encodeToken } from "../../../domain/value-objects/tokens";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { ITokenSecretService } from "../../../../../core/ports/system";
import type { AccountLinkRequest } from "../../../domain/entities/account-link-request";
import type { Session } from "../../../domain/entities/session";
import type { IdentityProviders, IdentityProvidersUserId } from "../../../domain/value-objects/identity-providers";
import type { AccountLinkRequestToken, SessionToken } from "../../../domain/value-objects/tokens";
import type {
	FederatedAuthCallbackUseCaseResult,
	IFederatedAuthCallbackUseCase,
} from "../../ports/in/federated-auth/callback.usecase.interface";
import type { IIdentityProviderGateway } from "../../ports/out/gateways/identity-provider.gateway.interface";
import type { IHmacSignedStateService } from "../../ports/out/infra/hmac-signed-state.service.interface";
import type { IAccountLinkRequestRepository } from "../../ports/out/repositories/account-link-request.repository.interface";
import type { IAuthUserRepository } from "../../ports/out/repositories/auth-user.repository.interface";
import type { IProviderAccountRepository } from "../../ports/out/repositories/provider-account.repository.interface";
import type { ISessionRepository } from "../../ports/out/repositories/session.repository.interface";
import type { federatedAuthStateSchema } from "./schema";

export class FederatedAuthCallbackUseCase implements IFederatedAuthCallbackUseCase {
	constructor(
		// gateways
		private readonly discordIdentityProviderGateway: IIdentityProviderGateway,
		private readonly googleIdentityProviderGateway: IIdentityProviderGateway,
		// repositories
		private readonly accountLinkRequestRepository: IAccountLinkRequestRepository,
		private readonly authUserRepository: IAuthUserRepository,
		private readonly providerAccountRepository: IProviderAccountRepository,
		private readonly sessionRepository: ISessionRepository,
		// system
		private readonly federatedAuthSignedStateService: IHmacSignedStateService<typeof federatedAuthStateSchema>,
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	public async execute(
		production: boolean,
		error: string | undefined,
		redirectURI: string,
		provider: IdentityProviders,
		signedState: string,
		code: string | undefined,
		codeVerifier: string,
	): Promise<FederatedAuthCallbackUseCaseResult> {
		const validatedState = this.federatedAuthSignedStateService.verify(signedState);

		if (validatedState.isErr) {
			return err("INVALID_STATE");
		}

		const { client } = validatedState.value;

		const clientPlatform = newClientPlatform(client);

		const identityProviderGateway = match(provider)
			.when(isGoogleProvider, () => this.googleIdentityProviderGateway)
			.when(isDiscordProvider, () => this.discordIdentityProviderGateway)
			.exhaustive();

		const clientBaseURL = match(clientPlatform)
			.when(isWebPlatform, () => getWebBaseURL(production))
			.when(isMobilePlatform, () => getMobileScheme(production))
			.exhaustive();

		const redirectToClientURL = validateRedirectURL(clientBaseURL, redirectURI ?? "/");

		if (!redirectToClientURL) {
			return err("INVALID_REDIRECT_URI");
		}

		if (error) {
			if (error === "access_denied") {
				return err("PROVIDER_ACCESS_DENIED", { redirectURL: redirectToClientURL });
			}

			return err("PROVIDER_ERROR", { redirectURL: redirectToClientURL });
		}

		if (!code) {
			return err("TOKEN_EXCHANGE_FAILED");
		}

		const tokensResult = await identityProviderGateway.exchangeCodeForTokens(code, codeVerifier);

		if (tokensResult.isErr) {
			const { code } = tokensResult;

			if (code === "CREDENTIALS_INVALID" || code === "FETCH_TOKENS_FAILED") {
				return err("TOKEN_EXCHANGE_FAILED");
			}
		}

		const tokens = tokensResult.value;

		const getIdentityProviderUserResult = await identityProviderGateway.getUserInfo(tokens);

		await identityProviderGateway.revokeToken(tokens);

		if (getIdentityProviderUserResult.isErr) {
			const { code } = getIdentityProviderUserResult;

			if (code === "INVALID_USER_INFO" || code === "USER_INFO_GET_FAILED") {
				return err("USER_INFO_GET_FAILED", { redirectURL: redirectToClientURL });
			}
		}

		const { userInfo } = getIdentityProviderUserResult.value;
		const providerUserId = newIdentityProvidersUserId(userInfo.id);

		const [existingProviderAccount, existingUserCredentialsForSameEmail] = await Promise.all([
			this.providerAccountRepository.findByProviderAndProviderUserId(provider, providerUserId),
			this.authUserRepository.findByEmail(userInfo.email),
		]);

		if (existingProviderAccount) {
			// Login flow
			const { session, sessionToken } = this.createSession(existingProviderAccount.userId);

			await this.sessionRepository.save(session);

			return ok({
				session,
				sessionToken,
				redirectURL: redirectToClientURL,
				clientPlatform,
				flow: "login",
			});
		}

		if (existingUserCredentialsForSameEmail) {
			// Link flow

			const { accountLinkRequest, accountLinkRequestToken } = this.createAccountLinkRequest(
				existingUserCredentialsForSameEmail.id,
				existingUserCredentialsForSameEmail.email,
				provider,
				providerUserId,
			);

			await this.accountLinkRequestRepository.deleteByUserId(existingUserCredentialsForSameEmail.id);
			await this.accountLinkRequestRepository.save(accountLinkRequest);

			return err("ACCOUNT_LINK_REQUEST", {
				redirectURL: redirectToClientURL,
				clientPlatform,
				accountLinkRequest,
				accountLinkRequestToken,
			});
		}

		// Signup flow

		const userId = newUserId(ulid());
		const userRegistration = createUserRegistration({
			id: userId,
			email: userInfo.email,
			emailVerified: true,
			passwordHash: null,
			name: userInfo.name,
			iconUrl: userInfo.iconURL,
			gender: newGender(DEFAULT_USER_GENDER),
		});
		await this.authUserRepository.create(userRegistration);

		const { session, sessionToken } = this.createSession(userId);

		const providerAccount = createProviderAccount({
			provider,
			providerUserId,
			userId,
		});

		await Promise.all([this.sessionRepository.save(session), this.providerAccountRepository.save(providerAccount)]);

		return ok({
			session,
			sessionToken,
			redirectURL: redirectToClientURL,
			clientPlatform,
			flow: "signup",
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
		const sessionToken = encodeToken(id, secret) as SessionToken;
		return { session, sessionToken };
	}

	private createAccountLinkRequest(
		userId: UserId,
		email: string,
		provider: IdentityProviders,
		providerUserId: IdentityProvidersUserId,
	): {
		accountLinkRequest: AccountLinkRequest;
		accountLinkRequestToken: AccountLinkRequestToken;
	} {
		const id = newAccountLinkRequestId(ulid());
		const secret = this.tokenSecretService.generateSecret();
		const secretHash = this.tokenSecretService.hash(secret);

		const accountLinkRequest = createAccountLinkRequest({
			id,
			userId,
			code: null,
			secretHash,
			email,
			provider,
			providerUserId,
		});
		const accountLinkRequestToken = encodeToken(id, secret);

		return { accountLinkRequest, accountLinkRequestToken };
	}
}
