import { DiscordIdentityProviderGateway } from "../adapters/gateways/identity-provider/discord.gateway";
import { GoogleIdentityProviderGateway } from "../adapters/gateways/identity-provider/google.gateway";
import { AccountLinkSessionRepository } from "../adapters/repositories/account-link-session/account-link-session.repository";
import { AuthUserRepository } from "../adapters/repositories/auth-user/auth-user.repository";
import { EmailVerificationSessionRepository } from "../adapters/repositories/email-verification-session/email-verification-session.repository";
import { PasswordResetSessionRepository } from "../adapters/repositories/password-reset-session/password-reset-session.repository";
import { ProviderAccountRepository } from "../adapters/repositories/provider-account/provider-account.repository";
import { ProviderConnectionTicketRepository } from "../adapters/repositories/provider-connection-ticket/provider-connection-ticket.repository";
import { SessionRepository } from "../adapters/repositories/session/session.repository";
import { SignupSessionRepository } from "../adapters/repositories/signup-session/signup-session.repository";
import { AccountLinkCompleteUseCase } from "../application/use-cases/account-link/complete.usecase";
import { AccountLinkReissueSessionUseCase } from "../application/use-cases/account-link/reissue-session.usecase";
import { AccountLinkValidateSessionUseCase } from "../application/use-cases/account-link/validate-session.usecase";
import { EmailVerificationCompleteUseCase } from "../application/use-cases/email-verification/complete.usecase";
import { EmailVerificationInitiateUseCase } from "../application/use-cases/email-verification/initiate.usecase";
import { EmailVerificationValidateSessionUseCase } from "../application/use-cases/email-verification/validate-session.usecase";
import { FederatedAuthCallbackUseCase } from "../application/use-cases/federated-auth/callback.usecase";
import { FederatedAuthInitiateUseCase } from "../application/use-cases/federated-auth/initiate.usecase";
import { oauthStateSchema } from "../application/use-cases/federated-auth/schema";
import { PasswordResetCompleteUseCase } from "../application/use-cases/password-reset/complete.usecase";
import { PasswordResetInitiateUseCase } from "../application/use-cases/password-reset/initiate.usecase";
import { PasswordResetValidateSessionUseCase } from "../application/use-cases/password-reset/validate-session.usecase";
import { PasswordResetVerifyEmailUseCase } from "../application/use-cases/password-reset/verify-email.usecase";
import { ProviderConnectionCallbackUseCase } from "../application/use-cases/provider-connection/callback.usecase";
import { ProviderConnectionDisconnectUseCase } from "../application/use-cases/provider-connection/disconnect.usecase";
import { ProviderConnectionInitiateUseCase } from "../application/use-cases/provider-connection/initiate.usecase";
import { ProviderConnectionPrepareUseCase } from "../application/use-cases/provider-connection/prepare.usecase";
import { providerConnectionStateSchema } from "../application/use-cases/provider-connection/schema";
import { ProviderConnectionValidateTicketUseCase } from "../application/use-cases/provider-connection/validate-ticket.usecase";
import { ListAuthMethodsUseCase } from "../application/use-cases/session/list-auth-methods.usecase";
import { LoginUseCase } from "../application/use-cases/session/login.usecase";
import { LogoutUseCase } from "../application/use-cases/session/logout.usecase";
import { UpdatePasswordUseCase } from "../application/use-cases/session/update-password.usecase";
import { ValidateSessionUseCase } from "../application/use-cases/session/validate-session.usecase";
import { SignupCompleteUseCase } from "../application/use-cases/signup/complete.usecase";
import { SignupInitiateUseCase } from "../application/use-cases/signup/initiate.usecase";
import { SignupValidateSessionUseCase } from "../application/use-cases/signup/validate-session.usecase";
import { SignupVerifyEmailUseCase } from "../application/use-cases/signup/verify-email.usecase";
import { UpdateEmailCompleteUseCase } from "../application/use-cases/update-email/complete.usecase";
import { UpdateEmailInitiateUseCase } from "../application/use-cases/update-email/initiate.usecase";
import { HmacOAuthStateService } from "../infra/hmac-oauth-state/hmac-oauth-state.service";
import { federatedAuthRedirectURL, providerConnectionRedirectURL } from "../lib/redirect-url";

import type { ICoreDIContainer } from "../../../core/di";
import type { EnvVariables } from "../../../core/infra/config/env";
import type { IAccountLinkCompleteUseCase } from "../application/contracts/account-link/complete.usecase.interface";
import type { IAccountLinkReissueSessionUseCase } from "../application/contracts/account-link/reissue-session.usecase.interface";
import type { IAccountLinkValidateSessionUseCase } from "../application/contracts/account-link/validate-session.usecase.interface";
import type { IEmailVerificationCompleteUseCase } from "../application/contracts/email-verification/complete.usecase.interface";
import type { IEmailVerificationInitiateUseCase } from "../application/contracts/email-verification/initiate.usecase.interface";
import type { IEmailVerificationValidateSessionUseCase } from "../application/contracts/email-verification/validate-email-verification-session.usecase.interface";
import type { IFederatedAuthCallbackUseCase } from "../application/contracts/federated-auth/callback.usecase.interface";
import type { IFederatedAuthInitiateUseCase } from "../application/contracts/federated-auth/initiate.usecase.interface";
import type { IPasswordResetCompleteUseCase } from "../application/contracts/password-reset/complete.usecase.interface";
import type { IPasswordResetInitiateUseCase } from "../application/contracts/password-reset/initiate.usecase.interface";
import type { IPasswordResetValidateSessionUseCase } from "../application/contracts/password-reset/validate-session.usecase.interface";
import type { IPasswordResetVerifyEmailUseCase } from "../application/contracts/password-reset/verify-email.usecase.interface";
import type { IProviderConnectionCallbackUseCase } from "../application/contracts/provider-connection/callback.usecase.interface";
import type { IProviderConnectionDisconnectUseCase } from "../application/contracts/provider-connection/disconnect.usecase.interface";
import type { IProviderConnectionInitiateUseCase } from "../application/contracts/provider-connection/initiate.usecase.interface";
import type { IProviderConnectionPrepareUseCase } from "../application/contracts/provider-connection/prepare.usecase.interface";
import type { IProviderConnectionValidateTicketUseCase } from "../application/contracts/provider-connection/validate-ticket.usecase.interface";
import type { IListAuthMethodsUseCase } from "../application/contracts/session/list-auth-methods.usecase.interface";
import type { ILoginUseCase } from "../application/contracts/session/login.usecase.interface";
import type { ILogoutUseCase } from "../application/contracts/session/logout.usecase.interface";
import type { IUpdatePasswordUseCase } from "../application/contracts/session/update-password.usecase.interface";
import type { IValidateSessionUseCase } from "../application/contracts/session/validate-session.usecase.interface";
import type { ISignupCompleteUseCase } from "../application/contracts/signup/complete.usecase.interface";
import type { ISignupInitiateUseCase } from "../application/contracts/signup/initiate.usecase.interface";
import type { ISignupValidateSessionUseCase } from "../application/contracts/signup/validate-session.usecase.interface";
import type { ISignupVerifyEmailUseCase } from "../application/contracts/signup/verify-email.usecase.interface";
import type { IUpdateEmailCompleteUseCase } from "../application/contracts/update-email/complete.usecase.interface";
import type { IUpdateEmailInitiateUseCase } from "../application/contracts/update-email/initiate.usecase.interface";
import type { IIdentityProviderGateway } from "../application/ports/gateways/identity-provider.gateway.interface";
import type { IHmacOAuthStateService } from "../application/ports/infra/hmac-oauth-state.service.interface";
import type { IAccountLinkSessionRepository } from "../application/ports/repositories/account-link-session.repository.interface";
import type { IAuthUserRepository } from "../application/ports/repositories/auth-user.repository.interface";
import type { IEmailVerificationSessionRepository } from "../application/ports/repositories/email-verification-session.repository.interface";
import type { IPasswordResetSessionRepository } from "../application/ports/repositories/password-reset-session.repository.interface";
import type { IProviderAccountRepository } from "../application/ports/repositories/provider-account.repository.interface";
import type { IProviderConnectionTicketRepository } from "../application/ports/repositories/provider-connection-ticket.repository.interface";
import type { ISessionRepository } from "../application/ports/repositories/session.repository.interface";
import type { ISignupSessionRepository } from "../application/ports/repositories/signup-session.repository.interface";
import type { IAuthDIContainer } from "./container.interface";

/**
 * AuthDIContainer
 *
 * Auth機能のリポジトリとユースケースをSingletonとして管理するDIコンテナ
 *
 * @remarks
 * - SharedDIContainerへの参照を保持し、共通の依存関係を取得
 * - Lazy Initializationパターンでインスタンスを生成
 * - 完全にstatelessなため、Singletonとして使用しても安全
 */
export class AuthDIContainer implements IAuthDIContainer {
	private readonly envVariables: EnvVariables;
	private readonly coreContainer: ICoreDIContainer;

	// === Infra ===
	private _providerConnectionOAuthStateService:
		| IHmacOAuthStateService<typeof providerConnectionStateSchema>
		| undefined;
	private _federatedAuthHmacOAuthStateService: IHmacOAuthStateService<typeof oauthStateSchema> | undefined;

	// === Gateways ===
	private _providerConnectionGoogleIdentityProviderGateway: IIdentityProviderGateway | undefined;
	private _providerConnectionDiscordIdentityProviderGateway: IIdentityProviderGateway | undefined;
	private _federatedAuthDiscordIdentityProviderGateway: IIdentityProviderGateway | undefined;
	private _federatedAuthGoogleIdentityProviderGateway: IIdentityProviderGateway | undefined;

	// === Repositories ===
	private _accountLinkSessionRepository: IAccountLinkSessionRepository | undefined;
	private _authUserRepository: IAuthUserRepository | undefined;
	private _emailVerificationSessionRepository: IEmailVerificationSessionRepository | undefined;
	private _passwordResetSessionRepository: IPasswordResetSessionRepository | undefined;
	private _providerAccountRepository: IProviderAccountRepository | undefined;
	private _providerConnectionTicketRepository: IProviderConnectionTicketRepository | undefined;
	private _sessionRepository: ISessionRepository | undefined;
	private _signupSessionRepository: ISignupSessionRepository | undefined;

	// === Use Cases ===

	// Account Link
	private _accountLinkCompleteUseCase: IAccountLinkCompleteUseCase | undefined;
	private _accountLinkReissueSessionUseCase: IAccountLinkReissueSessionUseCase | undefined;
	private _accountLinkValidateSessionUseCase: IAccountLinkValidateSessionUseCase | undefined;

	// Email Verification
	private _emailVerificationCompleteUseCase: IEmailVerificationCompleteUseCase | undefined;
	private _emailVerificationInitiateUseCase: IEmailVerificationInitiateUseCase | undefined;
	private _emailVerificationValidateSessionUseCase: IEmailVerificationValidateSessionUseCase | undefined;

	// Federated Auth
	private _federatedAuthCallbackUseCase: IFederatedAuthCallbackUseCase | undefined;
	private _federatedAuthInitiateUseCase: IFederatedAuthInitiateUseCase | undefined;

	// Password Reset
	private _passwordResetCompleteUseCase: IPasswordResetCompleteUseCase | undefined;
	private _passwordResetInitiateUseCase: IPasswordResetInitiateUseCase | undefined;
	private _passwordResetVerifyEmailUseCase: IPasswordResetVerifyEmailUseCase | undefined;
	private _passwordResetValidateSessionUseCase: IPasswordResetValidateSessionUseCase | undefined;

	// Provider Connection
	private _providerConnectionCallbackUseCase: IProviderConnectionCallbackUseCase | undefined;
	private _providerConnectionDisconnectUseCase: IProviderConnectionDisconnectUseCase | undefined;
	private _providerConnectionInitiateUseCase: IProviderConnectionInitiateUseCase | undefined;
	private _providerConnectionPrepareUseCase: IProviderConnectionPrepareUseCase | undefined;
	private _providerConnectionValidateTicketUseCase: IProviderConnectionValidateTicketUseCase | undefined;

	// Session
	private _listAuthMethodsUseCase: IListAuthMethodsUseCase | undefined;
	private _loginUseCase: ILoginUseCase | undefined;
	private _logoutUseCase: ILogoutUseCase | undefined;
	private _updatePasswordUseCase: IUpdatePasswordUseCase | undefined;
	private _validateSessionUseCase: IValidateSessionUseCase | undefined;

	// Signup
	private _signupCompleteUseCase: ISignupCompleteUseCase | undefined;
	private _signupInitiateUseCase: ISignupInitiateUseCase | undefined;
	private _signupVerifyEmailUseCase: ISignupVerifyEmailUseCase | undefined;
	private _signupValidateSessionUseCase: ISignupValidateSessionUseCase | undefined;

	// Update Email
	private _updateEmailCompleteUseCase: IUpdateEmailCompleteUseCase | undefined;
	private _updateEmailInitiateUseCase: IUpdateEmailInitiateUseCase | undefined;

	constructor(envVariables: EnvVariables, coreContainer: ICoreDIContainer, override?: Partial<IAuthDIContainer>) {
		this.envVariables = envVariables;

		this.coreContainer = coreContainer;

		const overrides = override ?? {};

		// #region === Infra ===
		if (overrides.providerConnectionOAuthStateService) {
			this._providerConnectionOAuthStateService = overrides.providerConnectionOAuthStateService;
		}
		if (overrides.federatedAuthHmacOAuthStateService) {
			this._federatedAuthHmacOAuthStateService = overrides.federatedAuthHmacOAuthStateService;
		}
		// #endregion

		// #region === Gateways ===
		if (overrides.providerConnectionGoogleIdentityProviderGateway) {
			this._providerConnectionGoogleIdentityProviderGateway = overrides.providerConnectionGoogleIdentityProviderGateway;
		}
		if (overrides.providerConnectionDiscordIdentityProviderGateway) {
			this._providerConnectionDiscordIdentityProviderGateway =
				overrides.providerConnectionDiscordIdentityProviderGateway;
		}
		if (overrides.federatedAuthDiscordIdentityProviderGateway) {
			this._federatedAuthDiscordIdentityProviderGateway = overrides.federatedAuthDiscordIdentityProviderGateway;
		}
		if (overrides.federatedAuthGoogleIdentityProviderGateway) {
			this._federatedAuthGoogleIdentityProviderGateway = overrides.federatedAuthGoogleIdentityProviderGateway;
		}
		// #endregion

		// #region === Repositories ===
		if (overrides.accountLinkSessionRepository) {
			this._accountLinkSessionRepository = overrides.accountLinkSessionRepository;
		}
		if (overrides.authUserRepository) {
			this._authUserRepository = overrides.authUserRepository;
		}
		if (overrides.emailVerificationSessionRepository) {
			this._emailVerificationSessionRepository = overrides.emailVerificationSessionRepository;
		}
		if (overrides.passwordResetSessionRepository) {
			this._passwordResetSessionRepository = overrides.passwordResetSessionRepository;
		}
		if (overrides.providerAccountRepository) {
			this._providerAccountRepository = overrides.providerAccountRepository;
		}
		if (overrides.providerConnectionTicketRepository) {
			this._providerConnectionTicketRepository = overrides.providerConnectionTicketRepository;
		}
		if (overrides.sessionRepository) {
			this._sessionRepository = overrides.sessionRepository;
		}
		if (overrides.signupSessionRepository) {
			this._signupSessionRepository = overrides.signupSessionRepository;
		}
		// #endregion

		// #region === Use Cases ===

		// Account Link
		if (overrides.accountLinkCompleteUseCase) {
			this._accountLinkCompleteUseCase = overrides.accountLinkCompleteUseCase;
		}
		if (overrides.accountLinkReissueSessionUseCase) {
			this._accountLinkReissueSessionUseCase = overrides.accountLinkReissueSessionUseCase;
		}
		if (overrides.accountLinkValidateSessionUseCase) {
			this._accountLinkValidateSessionUseCase = overrides.accountLinkValidateSessionUseCase;
		}

		// Email Verification
		if (overrides.emailVerificationCompleteUseCase) {
			this._emailVerificationCompleteUseCase = overrides.emailVerificationCompleteUseCase;
		}
		if (overrides.emailVerificationInitiateUseCase) {
			this._emailVerificationInitiateUseCase = overrides.emailVerificationInitiateUseCase;
		}
		if (overrides.emailVerificationValidateSessionUseCase) {
			this._emailVerificationValidateSessionUseCase = overrides.emailVerificationValidateSessionUseCase;
		}

		// Federated Auth
		if (overrides.federatedAuthCallbackUseCase) {
			this._federatedAuthCallbackUseCase = overrides.federatedAuthCallbackUseCase;
		}
		if (overrides.federatedAuthInitiateUseCase) {
			this._federatedAuthInitiateUseCase = overrides.federatedAuthInitiateUseCase;
		}

		// Password Reset
		if (overrides.passwordResetCompleteUseCase) {
			this._passwordResetCompleteUseCase = overrides.passwordResetCompleteUseCase;
		}
		if (overrides.passwordResetInitiateUseCase) {
			this._passwordResetInitiateUseCase = overrides.passwordResetInitiateUseCase;
		}
		if (overrides.passwordResetVerifyEmailUseCase) {
			this._passwordResetVerifyEmailUseCase = overrides.passwordResetVerifyEmailUseCase;
		}
		if (overrides.passwordResetValidateSessionUseCase) {
			this._passwordResetValidateSessionUseCase = overrides.passwordResetValidateSessionUseCase;
		}

		// Provider Connection
		if (overrides.providerConnectionCallbackUseCase) {
			this._providerConnectionCallbackUseCase = overrides.providerConnectionCallbackUseCase;
		}
		if (overrides.providerConnectionDisconnectUseCase) {
			this._providerConnectionDisconnectUseCase = overrides.providerConnectionDisconnectUseCase;
		}
		if (overrides.providerConnectionInitiateUseCase) {
			this._providerConnectionInitiateUseCase = overrides.providerConnectionInitiateUseCase;
		}
		if (overrides.providerConnectionPrepareUseCase) {
			this._providerConnectionPrepareUseCase = overrides.providerConnectionPrepareUseCase;
		}
		if (overrides.providerConnectionValidateTicketUseCase) {
			this._providerConnectionValidateTicketUseCase = overrides.providerConnectionValidateTicketUseCase;
		}

		// Session
		if (overrides.listAuthMethodsUseCase) {
			this._listAuthMethodsUseCase = overrides.listAuthMethodsUseCase;
		}
		if (overrides.loginUseCase) {
			this._loginUseCase = overrides.loginUseCase;
		}
		if (overrides.logoutUseCase) {
			this._logoutUseCase = overrides.logoutUseCase;
		}
		if (overrides.updatePasswordUseCase) {
			this._updatePasswordUseCase = overrides.updatePasswordUseCase;
		}
		if (overrides.validateSessionUseCase) {
			this._validateSessionUseCase = overrides.validateSessionUseCase;
		}

		// Signup
		if (overrides.signupCompleteUseCase) {
			this._signupCompleteUseCase = overrides.signupCompleteUseCase;
		}
		if (overrides.signupInitiateUseCase) {
			this._signupInitiateUseCase = overrides.signupInitiateUseCase;
		}
		if (overrides.signupVerifyEmailUseCase) {
			this._signupVerifyEmailUseCase = overrides.signupVerifyEmailUseCase;
		}
		if (overrides.signupValidateSessionUseCase) {
			this._signupValidateSessionUseCase = overrides.signupValidateSessionUseCase;
		}

		// Update Email
		if (overrides.updateEmailCompleteUseCase) {
			this._updateEmailCompleteUseCase = overrides.updateEmailCompleteUseCase;
		}
		if (overrides.updateEmailInitiateUseCase) {
			this._updateEmailInitiateUseCase = overrides.updateEmailInitiateUseCase;
		}
		// #endregion
	}

	// #region === Infra ===
	get providerConnectionOAuthStateService(): IHmacOAuthStateService<typeof providerConnectionStateSchema> {
		if (!this._providerConnectionOAuthStateService) {
			this._providerConnectionOAuthStateService = new HmacOAuthStateService(
				providerConnectionStateSchema,
				this.coreContainer.hmacService,
			);
		}
		return this._providerConnectionOAuthStateService;
	}

	get federatedAuthHmacOAuthStateService(): IHmacOAuthStateService<typeof oauthStateSchema> {
		if (!this._federatedAuthHmacOAuthStateService) {
			this._federatedAuthHmacOAuthStateService = new HmacOAuthStateService(
				oauthStateSchema,
				this.coreContainer.hmacService,
			);
		}
		return this._federatedAuthHmacOAuthStateService;
	}
	// #endregion

	// #region === Gateways ===
	get providerConnectionGoogleIdentityProviderGateway(): IIdentityProviderGateway {
		if (!this._providerConnectionGoogleIdentityProviderGateway) {
			this._providerConnectionGoogleIdentityProviderGateway = new GoogleIdentityProviderGateway(
				this.envVariables.GOOGLE_CLIENT_ID,
				this.envVariables.GOOGLE_CLIENT_SECRET,
				providerConnectionRedirectURL(this.envVariables.APP_ENV === "production", "google"),
			);
		}
		return this._providerConnectionGoogleIdentityProviderGateway;
	}

	get providerConnectionDiscordIdentityProviderGateway(): IIdentityProviderGateway {
		if (!this._providerConnectionDiscordIdentityProviderGateway) {
			this._providerConnectionDiscordIdentityProviderGateway = new DiscordIdentityProviderGateway(
				this.envVariables.DISCORD_CLIENT_ID,
				this.envVariables.DISCORD_CLIENT_SECRET,
				providerConnectionRedirectURL(this.envVariables.APP_ENV === "production", "discord"),
			);
		}
		return this._providerConnectionDiscordIdentityProviderGateway;
	}

	get federatedAuthGoogleIdentityProviderGateway(): IIdentityProviderGateway {
		if (!this._federatedAuthGoogleIdentityProviderGateway) {
			this._federatedAuthGoogleIdentityProviderGateway = new GoogleIdentityProviderGateway(
				this.envVariables.GOOGLE_CLIENT_ID,
				this.envVariables.GOOGLE_CLIENT_SECRET,
				federatedAuthRedirectURL(this.envVariables.APP_ENV === "production", "google"),
			);
		}
		return this._federatedAuthGoogleIdentityProviderGateway;
	}

	get federatedAuthDiscordIdentityProviderGateway(): IIdentityProviderGateway {
		if (!this._federatedAuthDiscordIdentityProviderGateway) {
			this._federatedAuthDiscordIdentityProviderGateway = new DiscordIdentityProviderGateway(
				this.envVariables.DISCORD_CLIENT_ID,
				this.envVariables.DISCORD_CLIENT_SECRET,
				federatedAuthRedirectURL(this.envVariables.APP_ENV === "production", "discord"),
			);
		}
		return this._federatedAuthDiscordIdentityProviderGateway;
	}
	// #endregion

	// #region === Repositories ===
	get authUserRepository(): IAuthUserRepository {
		if (!this._authUserRepository) {
			this._authUserRepository = new AuthUserRepository(this.coreContainer.drizzleService);
		}
		return this._authUserRepository;
	}

	get sessionRepository(): ISessionRepository {
		if (!this._sessionRepository) {
			this._sessionRepository = new SessionRepository(this.coreContainer.drizzleService);
		}
		return this._sessionRepository;
	}

	get signupSessionRepository(): ISignupSessionRepository {
		if (!this._signupSessionRepository) {
			this._signupSessionRepository = new SignupSessionRepository(this.coreContainer.drizzleService);
		}
		return this._signupSessionRepository;
	}

	get passwordResetSessionRepository(): IPasswordResetSessionRepository {
		if (!this._passwordResetSessionRepository) {
			this._passwordResetSessionRepository = new PasswordResetSessionRepository(this.coreContainer.drizzleService);
		}
		return this._passwordResetSessionRepository;
	}

	get emailVerificationSessionRepository(): IEmailVerificationSessionRepository {
		if (!this._emailVerificationSessionRepository) {
			this._emailVerificationSessionRepository = new EmailVerificationSessionRepository(
				this.coreContainer.drizzleService,
			);
		}
		return this._emailVerificationSessionRepository;
	}

	get providerAccountRepository(): IProviderAccountRepository {
		if (!this._providerAccountRepository) {
			this._providerAccountRepository = new ProviderAccountRepository(this.coreContainer.drizzleService);
		}
		return this._providerAccountRepository;
	}

	get providerConnectionTicketRepository(): IProviderConnectionTicketRepository {
		if (!this._providerConnectionTicketRepository) {
			this._providerConnectionTicketRepository = new ProviderConnectionTicketRepository(
				this.coreContainer.drizzleService,
			);
		}
		return this._providerConnectionTicketRepository;
	}

	get accountLinkSessionRepository(): IAccountLinkSessionRepository {
		if (!this._accountLinkSessionRepository) {
			this._accountLinkSessionRepository = new AccountLinkSessionRepository(this.coreContainer.drizzleService);
		}
		return this._accountLinkSessionRepository;
	}
	// #endregion

	// #region === Use Cases ===

	// Account Link
	get accountLinkCompleteUseCase(): IAccountLinkCompleteUseCase {
		if (!this._accountLinkCompleteUseCase) {
			this._accountLinkCompleteUseCase = new AccountLinkCompleteUseCase(
				this.accountLinkSessionRepository,
				this.authUserRepository,
				this.providerAccountRepository,
				this.sessionRepository,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._accountLinkCompleteUseCase;
	}
	get accountLinkReissueSessionUseCase(): IAccountLinkReissueSessionUseCase {
		if (!this._accountLinkReissueSessionUseCase) {
			this._accountLinkReissueSessionUseCase = new AccountLinkReissueSessionUseCase(
				this.coreContainer.emailGateway,
				this.accountLinkSessionRepository,
				this.coreContainer.cryptoRandomService,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._accountLinkReissueSessionUseCase;
	}
	get accountLinkValidateSessionUseCase(): IAccountLinkValidateSessionUseCase {
		if (!this._accountLinkValidateSessionUseCase) {
			this._accountLinkValidateSessionUseCase = new AccountLinkValidateSessionUseCase(
				this.authUserRepository,
				this.accountLinkSessionRepository,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._accountLinkValidateSessionUseCase;
	}

	// Email Verification
	get emailVerificationCompleteUseCase(): IEmailVerificationCompleteUseCase {
		if (!this._emailVerificationCompleteUseCase) {
			this._emailVerificationCompleteUseCase = new EmailVerificationCompleteUseCase(
				this.authUserRepository,
				this.emailVerificationSessionRepository,
			);
		}
		return this._emailVerificationCompleteUseCase;
	}
	get emailVerificationInitiateUseCase(): IEmailVerificationInitiateUseCase {
		if (!this._emailVerificationInitiateUseCase) {
			this._emailVerificationInitiateUseCase = new EmailVerificationInitiateUseCase(
				this.coreContainer.emailGateway,
				this.emailVerificationSessionRepository,
				this.coreContainer.cryptoRandomService,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._emailVerificationInitiateUseCase;
	}
	get emailVerificationValidateSessionUseCase(): IEmailVerificationValidateSessionUseCase {
		if (!this._emailVerificationValidateSessionUseCase) {
			this._emailVerificationValidateSessionUseCase = new EmailVerificationValidateSessionUseCase(
				this.emailVerificationSessionRepository,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._emailVerificationValidateSessionUseCase;
	}

	// Federated Auth
	get federatedAuthCallbackUseCase(): IFederatedAuthCallbackUseCase {
		if (!this._federatedAuthCallbackUseCase) {
			this._federatedAuthCallbackUseCase = new FederatedAuthCallbackUseCase(
				this.federatedAuthDiscordIdentityProviderGateway,
				this.federatedAuthGoogleIdentityProviderGateway,
				this.accountLinkSessionRepository,
				this.authUserRepository,
				this.providerAccountRepository,
				this.sessionRepository,
				this.federatedAuthHmacOAuthStateService,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._federatedAuthCallbackUseCase;
	}
	get federatedAuthInitiateUseCase(): IFederatedAuthInitiateUseCase {
		if (!this._federatedAuthInitiateUseCase) {
			this._federatedAuthInitiateUseCase = new FederatedAuthInitiateUseCase(
				this.federatedAuthDiscordIdentityProviderGateway,
				this.federatedAuthGoogleIdentityProviderGateway,
				this.federatedAuthHmacOAuthStateService,
			);
		}
		return this._federatedAuthInitiateUseCase;
	}

	// Password Reset
	get passwordResetCompleteUseCase(): IPasswordResetCompleteUseCase {
		if (!this._passwordResetCompleteUseCase) {
			this._passwordResetCompleteUseCase = new PasswordResetCompleteUseCase(
				this.authUserRepository,
				this.passwordResetSessionRepository,
				this.sessionRepository,
				this.coreContainer.passwordHashingService,
			);
		}
		return this._passwordResetCompleteUseCase;
	}
	get passwordResetInitiateUseCase(): IPasswordResetInitiateUseCase {
		if (!this._passwordResetInitiateUseCase) {
			this._passwordResetInitiateUseCase = new PasswordResetInitiateUseCase(
				this.authUserRepository,
				this.passwordResetSessionRepository,
				this.coreContainer.cryptoRandomService,
				this.coreContainer.emailGateway,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._passwordResetInitiateUseCase;
	}
	get passwordResetVerifyEmailUseCase(): IPasswordResetVerifyEmailUseCase {
		if (!this._passwordResetVerifyEmailUseCase) {
			this._passwordResetVerifyEmailUseCase = new PasswordResetVerifyEmailUseCase(this.passwordResetSessionRepository);
		}
		return this._passwordResetVerifyEmailUseCase;
	}
	get passwordResetValidateSessionUseCase(): IPasswordResetValidateSessionUseCase {
		if (!this._passwordResetValidateSessionUseCase) {
			this._passwordResetValidateSessionUseCase = new PasswordResetValidateSessionUseCase(
				this.authUserRepository,
				this.passwordResetSessionRepository,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._passwordResetValidateSessionUseCase;
	}

	// Provider Connection
	get providerConnectionCallbackUseCase(): IProviderConnectionCallbackUseCase {
		if (!this._providerConnectionCallbackUseCase) {
			this._providerConnectionCallbackUseCase = new ProviderConnectionCallbackUseCase(
				this.providerConnectionDiscordIdentityProviderGateway,
				this.providerConnectionGoogleIdentityProviderGateway,
				this.providerAccountRepository,
				this.providerConnectionOAuthStateService,
			);
		}
		return this._providerConnectionCallbackUseCase;
	}
	get providerConnectionDisconnectUseCase(): IProviderConnectionDisconnectUseCase {
		if (!this._providerConnectionDisconnectUseCase) {
			this._providerConnectionDisconnectUseCase = new ProviderConnectionDisconnectUseCase(
				this.providerAccountRepository,
			);
		}
		return this._providerConnectionDisconnectUseCase;
	}
	get providerConnectionInitiateUseCase(): IProviderConnectionInitiateUseCase {
		if (!this._providerConnectionInitiateUseCase) {
			this._providerConnectionInitiateUseCase = new ProviderConnectionInitiateUseCase(
				this.providerConnectionDiscordIdentityProviderGateway,
				this.providerConnectionGoogleIdentityProviderGateway,
				this.providerConnectionOAuthStateService,
			);
		}
		return this._providerConnectionInitiateUseCase;
	}
	get providerConnectionPrepareUseCase(): IProviderConnectionPrepareUseCase {
		if (!this._providerConnectionPrepareUseCase) {
			this._providerConnectionPrepareUseCase = new ProviderConnectionPrepareUseCase(
				this.providerConnectionTicketRepository,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._providerConnectionPrepareUseCase;
	}
	get providerConnectionValidateTicketUseCase(): IProviderConnectionValidateTicketUseCase {
		if (!this._providerConnectionValidateTicketUseCase) {
			this._providerConnectionValidateTicketUseCase = new ProviderConnectionValidateTicketUseCase(
				this.authUserRepository,
				this.providerConnectionTicketRepository,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._providerConnectionValidateTicketUseCase;
	}

	// Session
	get listAuthMethodsUseCase(): IListAuthMethodsUseCase {
		if (!this._listAuthMethodsUseCase) {
			this._listAuthMethodsUseCase = new ListAuthMethodsUseCase(this.providerAccountRepository);
		}
		return this._listAuthMethodsUseCase;
	}
	get loginUseCase(): ILoginUseCase {
		if (!this._loginUseCase) {
			this._loginUseCase = new LoginUseCase(
				this.authUserRepository,
				this.sessionRepository,
				this.coreContainer.passwordHashingService,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._loginUseCase;
	}
	get logoutUseCase(): ILogoutUseCase {
		if (!this._logoutUseCase) {
			this._logoutUseCase = new LogoutUseCase(this.sessionRepository);
		}
		return this._logoutUseCase;
	}
	get updatePasswordUseCase(): IUpdatePasswordUseCase {
		if (!this._updatePasswordUseCase) {
			this._updatePasswordUseCase = new UpdatePasswordUseCase(
				this.authUserRepository,
				this.sessionRepository,
				this.coreContainer.passwordHashingService,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._updatePasswordUseCase;
	}
	get validateSessionUseCase(): IValidateSessionUseCase {
		if (!this._validateSessionUseCase) {
			this._validateSessionUseCase = new ValidateSessionUseCase(
				this.authUserRepository,
				this.sessionRepository,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._validateSessionUseCase;
	}

	// Signup
	get signupCompleteUseCase(): ISignupCompleteUseCase {
		if (!this._signupCompleteUseCase) {
			this._signupCompleteUseCase = new SignupCompleteUseCase(
				this.authUserRepository,
				this.sessionRepository,
				this.signupSessionRepository,
				this.coreContainer.tokenSecretService,
				this.coreContainer.passwordHashingService,
			);
		}
		return this._signupCompleteUseCase;
	}
	get signupInitiateUseCase(): ISignupInitiateUseCase {
		if (!this._signupInitiateUseCase) {
			this._signupInitiateUseCase = new SignupInitiateUseCase(
				this.coreContainer.emailGateway,
				this.authUserRepository,
				this.signupSessionRepository,
				this.coreContainer.cryptoRandomService,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._signupInitiateUseCase;
	}
	get signupVerifyEmailUseCase(): ISignupVerifyEmailUseCase {
		if (!this._signupVerifyEmailUseCase) {
			this._signupVerifyEmailUseCase = new SignupVerifyEmailUseCase(this.signupSessionRepository);
		}
		return this._signupVerifyEmailUseCase;
	}
	get signupValidateSessionUseCase(): ISignupValidateSessionUseCase {
		if (!this._signupValidateSessionUseCase) {
			this._signupValidateSessionUseCase = new SignupValidateSessionUseCase(
				this.signupSessionRepository,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._signupValidateSessionUseCase;
	}

	// Update Email
	get updateEmailCompleteUseCase(): IUpdateEmailCompleteUseCase {
		if (!this._updateEmailCompleteUseCase) {
			this._updateEmailCompleteUseCase = new UpdateEmailCompleteUseCase(
				this.authUserRepository,
				this.sessionRepository,
				this.emailVerificationSessionRepository,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._updateEmailCompleteUseCase;
	}
	get updateEmailInitiateUseCase(): IUpdateEmailInitiateUseCase {
		if (!this._updateEmailInitiateUseCase) {
			this._updateEmailInitiateUseCase = new UpdateEmailInitiateUseCase(
				this.emailVerificationSessionRepository,
				this.authUserRepository,
				this.coreContainer.cryptoRandomService,
				this.coreContainer.tokenSecretService,
				this.coreContainer.emailGateway,
			);
		}
		return this._updateEmailInitiateUseCase;
	}

	// #endregion
}
