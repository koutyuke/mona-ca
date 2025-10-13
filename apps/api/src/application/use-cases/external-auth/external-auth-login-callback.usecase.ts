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
	type ExternalIdentityProvider,
	type ExternalIdentityProviderUserId,
	type SessionToken,
	type UserId,
	newAccountAssociationSessionId,
	newClientType,
	newExternalIdentityProviderUserId,
	newSessionId,
} from "../../../domain/value-object";
import { formatSessionToken } from "../../../domain/value-object";
import type { ExternalAuthLoginCallbackUseCaseResult, IExternalAuthLoginCallbackUseCase } from "../../ports/in";
import type { IOAuthProviderGateway } from "../../ports/out/gateways";
import type {
	IAccountAssociationSessionRepository,
	IExternalIdentityRepository,
	ISessionRepository,
	IUserRepository,
} from "../../ports/out/repositories";
import type { IOAuthStateSigner, ISessionSecretHasher } from "../../ports/out/system";
import type { oauthStateSchema } from "./schema";

export class ExternalAuthLoginCallbackUseCase implements IExternalAuthLoginCallbackUseCase {
	constructor(
		private readonly oauthProviderGateway: IOAuthProviderGateway,
		private readonly sessionRepository: ISessionRepository,
		private readonly externalIdentityRepository: IExternalIdentityRepository,
		private readonly userRepository: IUserRepository,
		private readonly accountAssociationSessionRepository: IAccountAssociationSessionRepository,
		private readonly sessionSecretHasher: ISessionSecretHasher,
		private readonly oauthStateSigner: IOAuthStateSigner<typeof oauthStateSchema>,
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
		const validatedState = this.oauthStateSigner.validate(signedState);

		if (isErr(validatedState)) {
			return err("INVALID_STATE");
		}

		const { client } = validatedState;

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

		const exchangeCodeForTokensResult = await this.oauthProviderGateway.exchangeCodeForTokens(code, codeVerifier);

		if (isErr(exchangeCodeForTokensResult)) {
			const { code } = exchangeCodeForTokensResult;

			if (code === "CREDENTIALS_INVALID" || code === "FETCH_TOKENS_FAILED") {
				return err("TOKEN_EXCHANGE_FAILED");
			}
		}

		const getIdentityResult = await this.oauthProviderGateway.getIdentity(exchangeCodeForTokensResult);

		await this.oauthProviderGateway.revokeToken(exchangeCodeForTokensResult);

		if (isErr(getIdentityResult)) {
			const { code } = getIdentityResult;

			if (code === "ACCESS_TOKEN_INVALID" || code === "IDENTITY_INVALID" || code === "FETCH_IDENTITY_FAILED") {
				return err("GET_IDENTITY_FAILED", { redirectURL: redirectToClientURL });
			}
		}

		const identity = getIdentityResult;
		const identityUserId = newExternalIdentityProviderUserId(identity.id);

		const existingExternalIdentity = await this.externalIdentityRepository.findByProviderAndProviderUserId(
			provider,
			identityUserId,
		);

		const existingUserForSameEmail = await this.userRepository.findByEmail(identity.email);

		if (existingExternalIdentity) {
			const { session, sessionToken } = this.createSession(existingExternalIdentity.userId);

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
				identityUserId,
			);

			await this.accountAssociationSessionRepository.deleteByUserId(existingUserForSameEmail.id);
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
		provider: ExternalIdentityProvider,
		providerUserId: ExternalIdentityProviderUserId,
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
			providerUserId,
		});
		return { accountAssociationSession, accountAssociationSessionToken };
	}
}
