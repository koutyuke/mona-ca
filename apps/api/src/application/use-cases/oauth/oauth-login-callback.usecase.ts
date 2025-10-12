import { getMobileScheme, getWebBaseURL, validateRedirectURL } from "@mona-ca/core/utils";
import { err, isErr, ulid } from "../../../common/utils";
import {
	type AccountAssociationSession,
	type Session,
	createAccountAssociationSession,
	createSession,
} from "../../../domain/entities";
import {
	type AccountAssociationSessionToken,
	type OAuthProvider,
	type OAuthProviderId,
	type SessionToken,
	type UserId,
	newAccountAssociationSessionId,
	newClientType,
	newOAuthProviderId,
	newSessionId,
} from "../../../domain/value-object";
import { formatSessionToken } from "../../../domain/value-object";
import type { IOAuthLoginCallbackUseCase, OAuthLoginCallbackUseCaseResult } from "../../ports/in";
import type { IOAuthProviderGateway } from "../../ports/out/gateways";
import type {
	IAccountAssociationSessionRepository,
	IOAuthAccountRepository,
	ISessionRepository,
	IUserRepository,
} from "../../ports/out/repositories";
import type { IOAuthStateSigner, ISessionSecretHasher } from "../../ports/out/system";
import type { oauthStateSchema } from "./schema";

export class OAuthLoginCallbackUseCase implements IOAuthLoginCallbackUseCase {
	constructor(
		private readonly oauthProviderGateway: IOAuthProviderGateway,
		private readonly sessionRepository: ISessionRepository,
		private readonly oauthAccountRepository: IOAuthAccountRepository,
		private readonly userRepository: IUserRepository,
		private readonly accountAssociationSessionRepository: IAccountAssociationSessionRepository,
		private readonly sessionSecretHasher: ISessionSecretHasher,
		private readonly oauthStateSigner: IOAuthStateSigner<typeof oauthStateSchema>,
	) {}

	public async execute(
		production: boolean,
		error: string | undefined,
		redirectURI: string,
		provider: OAuthProvider,
		signedState: string,
		code: string | undefined,
		codeVerifier: string,
	): Promise<OAuthLoginCallbackUseCaseResult> {
		const validatedState = this.oauthStateSigner.validate(signedState);

		if (isErr(validatedState)) {
			return err("INVALID_OAUTH_STATE");
		}

		const { client } = validatedState;

		const clientType = newClientType(client);

		const clientBaseURL = clientType === "web" ? getWebBaseURL(production) : getMobileScheme();

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
				case "OAUTH_ACCOUNT_INFO_INVALID":
					return err("OAUTH_ACCOUNT_INFO_INVALID", { redirectURL: redirectToClientURL });
				default:
					return err("FAILED_TO_FETCH_OAUTH_ACCOUNT", { redirectURL: redirectToClientURL });
			}
		}

		const providerAccount = accountInfoResult;
		const providerId = newOAuthProviderId(providerAccount.id);

		const existingOAuthAccount = await this.oauthAccountRepository.findByProviderAndProviderId(provider, providerId);

		const existingUserForSameEmail = await this.userRepository.findByEmail(providerAccount.email);

		if (existingOAuthAccount) {
			const { session, sessionToken } = this.createSession(existingOAuthAccount.userId);

			await this.sessionRepository.save(session);

			return {
				session,
				sessionToken,
				redirectURL: redirectToClientURL,
				clientType,
			};
		}

		if (existingUserForSameEmail) {
			const { accountAssociationSession, accountAssociationSessionToken } = this.createAccountAssociationSession(
				existingUserForSameEmail.id,
				existingUserForSameEmail.email,
				provider,
				providerId,
			);

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

	private createSession(userId: UserId): {
		session: Session;
		sessionToken: SessionToken;
	} {
		const sessionSecret = this.sessionSecretHasher.generate();
		const sessionSecretHash = this.sessionSecretHasher.hash(sessionSecret);
		const sessionId = newSessionId(ulid());
		const sessionToken = formatSessionToken(sessionId, sessionSecret);
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
		provider: OAuthProvider,
		providerId: OAuthProviderId,
	): {
		accountAssociationSession: AccountAssociationSession;
		accountAssociationSessionToken: AccountAssociationSessionToken;
	} {
		const accountAssociationSessionSecret = this.sessionSecretHasher.generate();
		const accountAssociationSessionSecretHash = this.sessionSecretHasher.hash(accountAssociationSessionSecret);
		const accountAssociationSessionId = newAccountAssociationSessionId(ulid());
		const accountAssociationSessionToken = formatSessionToken(
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
			providerId,
		});
		return { accountAssociationSession, accountAssociationSessionToken };
	}
}
