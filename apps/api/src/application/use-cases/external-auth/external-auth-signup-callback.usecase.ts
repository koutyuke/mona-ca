import { getMobileScheme, getWebBaseURL, validateRedirectURL } from "@mona-ca/core/utils";
import { err, isErr, ulid } from "../../../common/utils";
import {
	type AccountAssociationSession,
	DEFAULT_USER_GENDER,
	type Session,
	createAccountAssociationSession,
	createExternalIdentity,
	createSession,
	createUser,
} from "../../../domain/entities";
import {
	type AccountAssociationSessionToken,
	type ExternalIdentityProvider,
	type ExternalIdentityProviderUserId,
	type SessionToken,
	type UserId,
	formatSessionToken,
	newAccountAssociationSessionId,
	newClientType,
	newExternalIdentityProviderUserId,
	newGender,
	newSessionId,
	newUserId,
} from "../../../domain/value-object";
import type { ExternalAuthSignupCallbackUseCaseResult, IExternalAuthSignupCallbackUseCase } from "../../ports/in";
import type { IOAuthProviderGateway } from "../../ports/out/gateways";
import type {
	IAccountAssociationSessionRepository,
	IExternalIdentityRepository,
	ISessionRepository,
	IUserRepository,
} from "../../ports/out/repositories";
import type { IOAuthStateSigner, ISessionSecretHasher } from "../../ports/out/system";
import type { oauthStateSchema } from "./schema";

export class ExternalAuthSignupCallbackUseCase implements IExternalAuthSignupCallbackUseCase {
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
	): Promise<ExternalAuthSignupCallbackUseCaseResult> {
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

		const tokensResult = await this.oauthProviderGateway.exchangeCodeForTokens(code, codeVerifier);

		if (isErr(tokensResult)) {
			const { code } = tokensResult;

			if (code === "CREDENTIALS_INVALID" || code === "FETCH_TOKENS_FAILED") {
				return err("TOKEN_EXCHANGE_FAILED");
			}
		}

		const getIdentityResult = await this.oauthProviderGateway.getIdentity(tokensResult);

		await this.oauthProviderGateway.revokeToken(tokensResult);

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
			return err("EXTERNAL_IDENTITY_ALREADY_REGISTERED", { redirectURL: redirectToClientURL });
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

			return err("EXTERNAL_IDENTITY_ALREADY_REGISTERED_BUT_LINKABLE", {
				redirectURL: redirectToClientURL,
				clientType,
				accountAssociationSessionToken,
				accountAssociationSession,
			});
		}

		const user = createUser({
			id: newUserId(ulid()),
			name: identity.name,
			email: identity.email,
			emailVerified: identity.emailVerified,
			iconUrl: identity.iconURL,
			gender: newGender(DEFAULT_USER_GENDER),
		});

		await this.userRepository.save(user, { passwordHash: null });

		const { session, sessionToken } = this.createSession(user.id);

		const externalIdentity = createExternalIdentity({
			provider,
			providerUserId: identityUserId,
			userId: user.id,
		});

		await Promise.all([this.sessionRepository.save(session), this.externalIdentityRepository.save(externalIdentity)]);

		return {
			session,
			sessionToken,
			redirectURL: redirectToClientURL,
			clientType,
		};
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
