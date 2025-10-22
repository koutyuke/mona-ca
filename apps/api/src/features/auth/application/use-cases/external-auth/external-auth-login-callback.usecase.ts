import { err, getMobileScheme, getWebBaseURL, ok, validateRedirectURL } from "@mona-ca/core/utils";
import { newClientType } from "../../../../../shared/domain/value-objects";
import { ulid } from "../../../../../shared/lib/id";
import { createAccountAssociationSession } from "../../../domain/entities/account-association-session";
import { createSession } from "../../../domain/entities/session";
import { newExternalIdentityProviderUserId } from "../../../domain/value-objects/external-identity";
import { newAccountAssociationSessionId, newSessionId } from "../../../domain/value-objects/ids";
import { formatAnySessionToken } from "../../../domain/value-objects/session-token";

import type { UserId } from "../../../../../shared/domain/value-objects";
import type { ISessionSecretHasher } from "../../../../../shared/ports/system";
import type { AccountAssociationSession } from "../../../domain/entities/account-association-session";
import type { Session } from "../../../domain/entities/session";
import type {
	ExternalIdentityProvider,
	ExternalIdentityProviderUserId,
} from "../../../domain/value-objects/external-identity";
import type { AccountAssociationSessionToken, SessionToken } from "../../../domain/value-objects/session-token";
import type {
	ExternalAuthLoginCallbackUseCaseResult,
	IExternalAuthLoginCallbackUseCase,
} from "../../contracts/external-auth/external-auth-login-callback.usecase.interface";
import type { IOAuthProviderGateway } from "../../ports/gateways/oauth-provider.gateway.interface";
import type { IHmacOAuthStateSigner } from "../../ports/infra/hmac-oauth-state-signer.interface";
import type { IAccountAssociationSessionRepository } from "../../ports/repositories/account-association-session.repository.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { IExternalIdentityRepository } from "../../ports/repositories/external-identity.repository.interface";
import type { ISessionRepository } from "../../ports/repositories/session.repository.interface";
import type { oauthStateSchema } from "./schema";

export class ExternalAuthLoginCallbackUseCase implements IExternalAuthLoginCallbackUseCase {
	constructor(
		private readonly googleOAuthGateway: IOAuthProviderGateway,
		private readonly discordOAuthGateway: IOAuthProviderGateway,
		private readonly sessionRepository: ISessionRepository,
		private readonly externalIdentityRepository: IExternalIdentityRepository,
		private readonly authUserRepository: IAuthUserRepository,
		private readonly accountAssociationSessionRepository: IAccountAssociationSessionRepository,
		private readonly sessionSecretHasher: ISessionSecretHasher,
		private readonly externalAuthOAuthStateSigner: IHmacOAuthStateSigner<typeof oauthStateSchema>,
	) {}

	public async execute(
		production: boolean,
		error: string | undefined,
		redirectURI: string,
		provider: ExternalIdentityProvider,
		signedState: string,
		code: string | undefined,
		codeVerifier: string,
	): Promise<ExternalAuthLoginCallbackUseCaseResult> {
		const oauthProviderGateway = provider === "google" ? this.googleOAuthGateway : this.discordOAuthGateway;
		const validatedState = this.externalAuthOAuthStateSigner.validate(signedState);

		if (validatedState.isErr) {
			return err("INVALID_STATE");
		}

		const { client } = validatedState.value;

		const clientType = newClientType(client);

		const clientBaseURL = clientType === "web" ? getWebBaseURL(production) : getMobileScheme();

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

		const exchangeCodeForTokensResult = await oauthProviderGateway.exchangeCodeForTokens(code, codeVerifier);

		if (exchangeCodeForTokensResult.isErr) {
			const { code } = exchangeCodeForTokensResult;

			if (code === "CREDENTIALS_INVALID" || code === "FETCH_TOKENS_FAILED") {
				return err("TOKEN_EXCHANGE_FAILED");
			}
		}

		const getIdentityResult = await oauthProviderGateway.getIdentity(exchangeCodeForTokensResult.value);

		await oauthProviderGateway.revokeToken(exchangeCodeForTokensResult.value);

		if (getIdentityResult.isErr) {
			const { code } = getIdentityResult;

			if (code === "ACCESS_TOKEN_INVALID" || code === "IDENTITY_INVALID" || code === "FETCH_IDENTITY_FAILED") {
				return err("GET_IDENTITY_FAILED", { redirectURL: redirectToClientURL });
			}
		}

		const { providerIdentity } = getIdentityResult.value;
		const identityUserId = newExternalIdentityProviderUserId(providerIdentity.id);

		const [existingExternalIdentity, existingUserIdentityForSameEmail] = await Promise.all([
			this.externalIdentityRepository.findByProviderAndProviderUserId(provider, identityUserId),
			this.authUserRepository.findByEmail(providerIdentity.email),
		]);

		if (existingExternalIdentity) {
			const { session, sessionToken } = this.createSession(existingExternalIdentity.userId);

			await this.sessionRepository.save(session);

			return ok({
				session,
				sessionToken,
				redirectURL: redirectToClientURL,
				clientType,
			});
		}

		if (existingUserIdentityForSameEmail) {
			const { accountAssociationSession, accountAssociationSessionToken } = this.createAccountAssociationSession(
				existingUserIdentityForSameEmail.id,
				existingUserIdentityForSameEmail.email,
				provider,
				identityUserId,
			);

			await this.accountAssociationSessionRepository.deleteByUserId(existingUserIdentityForSameEmail.id);
			await this.accountAssociationSessionRepository.save(accountAssociationSession);

			return err("ACCOUNT_ASSOCIATION_AVAILABLE", {
				redirectURL: redirectToClientURL,
				clientType,
				accountAssociationSessionToken,
				accountAssociationSession,
			});
		}
		return err("ACCOUNT_ASSOCIATION_NOT_FOUND", { redirectURL: redirectToClientURL });
	}

	private createSession(userId: UserId): {
		session: Session;
		sessionToken: SessionToken;
	} {
		const sessionSecret = this.sessionSecretHasher.generate();
		const sessionSecretHash = this.sessionSecretHasher.hash(sessionSecret);
		const sessionId = newSessionId(ulid());
		const sessionToken = formatAnySessionToken(sessionId, sessionSecret);
		const session = createSession({
			id: sessionId,
			userId,
			secretHash: sessionSecretHash,
		});
		return { session, sessionToken };
	}

	private createAccountAssociationSession(
		userId: UserId,
		email: string,
		provider: ExternalIdentityProvider,
		providerUserId: ExternalIdentityProviderUserId,
	): {
		accountAssociationSession: AccountAssociationSession;
		accountAssociationSessionToken: AccountAssociationSessionToken;
	} {
		const accountAssociationSessionSecret = this.sessionSecretHasher.generate();
		const accountAssociationSessionSecretHash = this.sessionSecretHasher.hash(accountAssociationSessionSecret);
		const accountAssociationSessionId = newAccountAssociationSessionId(ulid());
		const accountAssociationSessionToken = formatAnySessionToken(
			accountAssociationSessionId,
			accountAssociationSessionSecret,
		);
		const accountAssociationSession = createAccountAssociationSession({
			id: accountAssociationSessionId,
			userId,
			code: null,
			secretHash: accountAssociationSessionSecretHash,
			email,
			provider,
			providerUserId,
		});
		return { accountAssociationSession, accountAssociationSessionToken };
	}
}
