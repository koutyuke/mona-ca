import { err, ulid } from "../../../common/utils";
import { createOAuthAccount, createSession, createUser } from "../../../domain/entities";
import {
	type OAuthProvider,
	newGender,
	newOAuthProviderId,
	newSessionId,
	newUserId,
} from "../../../domain/value-object";
import type { IOAuthProviderGateway } from "../../../interface-adapter/gateway/oauth-provider";
import type { IOAuthAccountRepository } from "../../../interface-adapter/repositories/oauth-account";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { ISessionTokenService } from "../../services/session-token";
import type {
	IOAuthSignupCallbackUseCase,
	OAuthSignupCallbackUseCaseResult,
} from "./interfaces/oauth-signup-callback.usecase.interface";

export class OAuthSignupCallbackUseCase implements IOAuthSignupCallbackUseCase {
	constructor(
		private readonly sessionTokenService: ISessionTokenService,
		private readonly oauthProviderGateway: IOAuthProviderGateway,
		private readonly sessionRepository: ISessionRepository,
		private readonly oauthAccountRepository: IOAuthAccountRepository,
		private readonly userRepository: IUserRepository,
	) {}

	/**
	 * Executes the OAuth signup callback use case.
	 *
	 * @param code - The authorization code received from the OAuth provider.
	 * @param codeVerifier - The code verifier used for PKCE (Proof Key for Code Exchange).
	 * @param provider - The OAuth provider (e.g., Google, Facebook).
	 * @param userOption - Optional user options, such as gender.
	 * @return The result of the OAuth signup callback use case.
	 * @return `Err<FAILED_TO_GET_ACCOUNT_INFO>` - If the account information could not be retrieved.
	 * @return `Err<SAME_EMAIL_USER_ALREADY_EXISTS>` - If the user is already registered. It can link the OAuth account to the existing user.
	 * @return `Err<ACCOUNT_IS_ALREADY_USED>` - If the account is already used.
	 */
	public async execute(
		code: string,
		codeVerifier: string,
		provider: OAuthProvider,
	): Promise<OAuthSignupCallbackUseCaseResult> {
		const tokens = await this.oauthProviderGateway.getTokens(code, codeVerifier);
		const accessToken = tokens.accessToken();

		const providerAccount = await this.oauthProviderGateway.getAccountInfo(accessToken);

		await this.oauthProviderGateway.revokeToken(accessToken);

		if (!providerAccount) {
			return err("FAILED_TO_GET_ACCOUNT_INFO");
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
					return err("ACCOUNT_IS_ALREADY_USED");
				}

				return err("EMAIL_ALREADY_EXISTS_BUT_LINKABLE");
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
			gender: newGender("man"),
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
		};
	}
}
