import { sessionExpiresSpan } from "../../../common/constants";
import { err, ulid } from "../../../common/utils";
import type { OAuthProvider } from "../../../domain/entities";
import type { IOAuthProviderGateway } from "../../../interface-adapter/gateway/oauth-provider";
import type { IOAuthAccountRepository } from "../../../interface-adapter/repositories/oauth-account";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { IUserCredentialRepository } from "../../../interface-adapter/repositories/user-credential";
import type { ISessionTokenService } from "../../services/session-token";
import type {
	IOAuthSignupCallbackUseCase,
	OAuthSignupCallbackUseCaseResult,
} from "./interfaces/oauth-signup-callback.usecase.interface";

export class OAuthSignupCallbackUseCase implements IOAuthSignupCallbackUseCase {
	constructor(
		private readonly sessionTokenService: ISessionTokenService,
		private readonly oAuthProviderGateway: IOAuthProviderGateway,
		private readonly sessionRepository: ISessionRepository,
		private readonly oAuthAccountRepository: IOAuthAccountRepository,
		private readonly userRepository: IUserRepository,
		private readonly userCredentialRepository: IUserCredentialRepository,
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
		userOption?: { gender?: "man" | "woman" },
	): Promise<OAuthSignupCallbackUseCaseResult> {
		const { gender = "man" } = userOption ?? {};

		const tokens = await this.oAuthProviderGateway.getTokens(code, codeVerifier);
		const accessToken = tokens.accessToken();

		const providerAccount = await this.oAuthProviderGateway.getAccountInfo(accessToken);

		await this.oAuthProviderGateway.revokeToken(accessToken);

		if (!providerAccount) {
			return err("FAILED_TO_GET_ACCOUNT_INFO");
		}

		const existingOAuthAccount = await this.oAuthAccountRepository.findByProviderAndProviderId(
			provider,
			providerAccount.id,
		);

		// check pre-register user
		const existingUser = existingOAuthAccount
			? await this.userRepository.find(existingOAuthAccount.userId)
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
			await this.oAuthAccountRepository.deleteByProviderAndProviderId(provider, providerAccount.id);
		}

		const user = await this.userRepository.create({
			id: ulid(),
			name: providerAccount.name,
			email: providerAccount.email,
			emailVerified: providerAccount.emailVerified, // if emailVerified is false, this user is pre-register user
			iconUrl: providerAccount.iconUrl,
			gender,
		});

		const sessionToken = this.sessionTokenService.generateSessionToken();
		const sessionId = this.sessionTokenService.hashSessionToken(sessionToken);

		const [session] = await Promise.all([
			this.sessionRepository.create({
				id: sessionId,
				userId: user.id,
				expiresAt: new Date(Date.now() + sessionExpiresSpan.milliseconds()),
			}),
			this.userCredentialRepository.create({
				userId: user.id,
				passwordHash: null,
			}),
			this.oAuthAccountRepository.create({
				provider,
				providerId: providerAccount.id,
				userId: user.id,
			}),
		]);

		return {
			session,
			sessionToken,
		};
	}
}
