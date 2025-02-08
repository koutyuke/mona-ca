import { sessionExpiresSpan } from "../../../common/constants";
import { ulid } from "../../../common/utils";
import type { IOAuthProviderGateway } from "../../../interface-adapter/gateway/oauth-provider";
import type { IOAuthAccountRepository } from "../../../interface-adapter/repositories/oauth-account";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { IUserCredentialRepository } from "../../../interface-adapter/repositories/user-credential";
import type { OAuthProvider } from "../../../models/entities/oauth-account";
import type { ISessionTokenService } from "../../../services/session-token";
import type {
	IOAuthSignupCallbackUseCase,
	IOAuthSignupCallbackUseCaseResult,
} from "./interface/oauth-signup-callback.usecase.interface";

export class OAuthSignupCallbackUseCase implements IOAuthSignupCallbackUseCase {
	constructor(
		private readonly sessionTokenService: ISessionTokenService,
		private readonly oAuthProviderGateway: IOAuthProviderGateway,
		private readonly sessionRepository: ISessionRepository,
		private readonly oAuthAccountRepository: IOAuthAccountRepository,
		private readonly userRepository: IUserRepository,
		private readonly userCredentialRepository: IUserCredentialRepository,
	) {}

	public async execute(
		code: string,
		codeVerifier: string,
		provider: OAuthProvider,
		userOption?: { gender?: "man" | "woman" },
	): Promise<IOAuthSignupCallbackUseCaseResult> {
		const { gender = "man" } = userOption ?? {};

		const tokens = await this.oAuthProviderGateway.getTokens(code, codeVerifier);
		const accessToken = tokens.accessToken();

		const providerAccount = await this.oAuthProviderGateway.getAccountInfo(accessToken);

		if (!providerAccount) {
			throw new Error("Failed to get account info");
		}

		const [existingUser, existingOAuthAccount] = await Promise.all([
			this.userRepository.findByEmail(providerAccount.email),
			this.oAuthAccountRepository.findByProviderAndProviderId(provider, providerAccount.id),
		]);

		if (existingUser) {
			throw new Error("User already exists");
		}

		if (existingOAuthAccount) {
			throw new Error("OAuth account already exists");
		}

		const linkedUser =
			existingUser ??
			(await this.userRepository.create({
				id: ulid(),
				name: providerAccount.name,
				email: providerAccount.email,
				emailVerified: providerAccount.emailVerified, // if emailVerified is false, this user is pre-register user
				iconUrl: providerAccount.iconUrl,
				gender,
			}));

		const sessionToken = this.sessionTokenService.generateSessionToken();
		const sessionId = this.sessionTokenService.hashSessionToken(sessionToken);

		const [session] = await Promise.all([
			this.sessionRepository.create({
				id: sessionId,
				userId: linkedUser.id,
				expiresAt: new Date(Date.now() + sessionExpiresSpan.milliseconds()),
			}),
			this.userCredentialRepository.create({
				userId: linkedUser.id,
				passwordHash: null,
			}),
			this.oAuthProviderGateway.revokeToken(accessToken),
			this.oAuthAccountRepository.create({
				provider,
				providerId: providerAccount.id,
				userId: linkedUser.id,
			}),
		]);

		return {
			session,
			sessionToken,
		};
	}
}
