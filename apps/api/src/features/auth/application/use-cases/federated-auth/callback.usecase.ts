import { getMobileScheme, getWebBaseURL, validateRedirectURL } from "@mona-ca/core/http";
import { err, ok } from "@mona-ca/core/result";
import { newClientPlatform, newGender, newUserId } from "../../../../../core/domain/value-objects";
import { ulid } from "../../../../../core/lib/id";
import { createProviderAccount } from "../../../domain/entities/provider-account";
import { type ProviderLinkProposal, createProviderLinkProposal } from "../../../domain/entities/provider-link-proposal";
import { createSession } from "../../../domain/entities/session";
import { DEFAULT_USER_GENDER, createUserRegistration } from "../../../domain/entities/user-registration";
import {
	type IdentityProvidersUserId,
	newIdentityProvidersUserId,
} from "../../../domain/value-objects/identity-providers";
import { newProviderLinkProposalId, newSessionId } from "../../../domain/value-objects/ids";
import { encodeToken } from "../../../domain/value-objects/tokens";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { ITokenSecretService } from "../../../../../core/ports/system";
import type { Session } from "../../../domain/entities/session";
import type { IdentityProviders } from "../../../domain/value-objects/identity-providers";
import type { ProviderLinkProposalToken, SessionToken } from "../../../domain/value-objects/tokens";
import type {
	FederatedAuthCallbackUseCaseResult,
	IFederatedAuthCallbackUseCase,
} from "../../contracts/federated-auth/callback.usecase.interface";
import type { IIdentityProviderGateway } from "../../ports/gateways/identity-provider.gateway.interface";
import type { IHmacOAuthStateService } from "../../ports/infra/hmac-oauth-state.service.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { IProviderAccountRepository } from "../../ports/repositories/provider-account.repository.interface";
import type { IProviderLinkProposalRepository } from "../../ports/repositories/provider-link-proposal.repository.interface";
import type { ISessionRepository } from "../../ports/repositories/session.repository.interface";
import type { oauthStateSchema } from "./schema";

export class FederatedAuthCallbackUseCase implements IFederatedAuthCallbackUseCase {
	constructor(
		// gateways
		private readonly discordIdentityProviderGateway: IIdentityProviderGateway,
		private readonly googleIdentityProviderGateway: IIdentityProviderGateway,
		// repositories
		private readonly providerLinkProposalRepository: IProviderLinkProposalRepository,
		private readonly authUserRepository: IAuthUserRepository,
		private readonly providerAccountRepository: IProviderAccountRepository,
		private readonly sessionRepository: ISessionRepository,
		// system
		private readonly federatedAuthHmacOAuthStateService: IHmacOAuthStateService<typeof oauthStateSchema>,
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
		const identityProviderGateway =
			provider === "google" ? this.googleIdentityProviderGateway : this.discordIdentityProviderGateway;
		const validatedState = this.federatedAuthHmacOAuthStateService.validate(signedState);

		if (validatedState.isErr) {
			return err("INVALID_STATE");
		}

		const { client } = validatedState.value;

		const clientPlatform = newClientPlatform(client);

		const clientBaseURL = clientPlatform === "web" ? getWebBaseURL(production) : getMobileScheme(production);

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

		const getIdentityProviderUserResult = await identityProviderGateway.getProviderUser(tokens);

		await identityProviderGateway.revokeToken(tokens);

		if (getIdentityProviderUserResult.isErr) {
			const { code } = getIdentityProviderUserResult;

			if (code === "PROVIDER_USER_INVALID" || code === "GET_PROVIDER_USER_FAILED") {
				return err("GET_PROVIDER_USER_FAILED", { redirectURL: redirectToClientURL });
			}
		}

		const { providerUser } = getIdentityProviderUserResult.value;
		const providerUserId = newIdentityProvidersUserId(providerUser.id);

		const [existingProviderAccount, existingUserCredentialsForSameEmail] = await Promise.all([
			this.providerAccountRepository.findByProviderAndProviderUserId(provider, providerUserId),
			this.authUserRepository.findByEmail(providerUser.email),
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

			const { providerLinkProposal, providerLinkProposalToken } = this.createProviderLinkProposal(
				existingUserCredentialsForSameEmail.id,
				existingUserCredentialsForSameEmail.email,
				provider,
				providerUserId,
			);

			await this.providerLinkProposalRepository.deleteByUserId(existingUserCredentialsForSameEmail.id);
			await this.providerLinkProposalRepository.save(providerLinkProposal);

			return err("PROVIDER_LINK_PROPOSAL", {
				redirectURL: redirectToClientURL,
				clientPlatform,
				providerLinkProposal,
				providerLinkProposalToken,
			});
		}

		// Signup flow

		const userId = newUserId(ulid());
		const userRegistration = createUserRegistration({
			id: userId,
			email: providerUser.email,
			emailVerified: true,
			passwordHash: null,
			name: providerUser.name,
			iconUrl: providerUser.iconURL,
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
		const sessionToken = encodeToken(id, secret);
		return { session, sessionToken };
	}

	private createProviderLinkProposal(
		userId: UserId,
		email: string,
		provider: IdentityProviders,
		providerUserId: IdentityProvidersUserId,
	): {
		providerLinkProposal: ProviderLinkProposal;
		providerLinkProposalToken: ProviderLinkProposalToken;
	} {
		const id = newProviderLinkProposalId(ulid());
		const secret = this.tokenSecretService.generateSecret();
		const secretHash = this.tokenSecretService.hash(secret);

		const providerLinkProposal = createProviderLinkProposal({
			id,
			userId,
			code: null,
			secretHash,
			email,
			provider,
			providerUserId,
		});
		const providerLinkProposalToken = encodeToken(id, secret);

		return { providerLinkProposal, providerLinkProposalToken };
	}
}
