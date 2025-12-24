import { DiscordIdentityProviderGateway } from "../adapters/gateways/identity-provider/discord.gateway";
import { GoogleIdentityProviderGateway } from "../adapters/gateways/identity-provider/google.gateway";
import { AccountLinkRequestRepository } from "../adapters/repositories/account-link-request/account-link-request.repository";
import { AuthUserRepository } from "../adapters/repositories/auth-user/auth-user.repository";
import { EmailVerificationRequestRepository } from "../adapters/repositories/email-verification-request/email-verification-request.repository";
import { PasswordResetSessionRepository } from "../adapters/repositories/password-reset-session/password-reset-session.repository";
import { ProviderAccountRepository } from "../adapters/repositories/provider-account/provider-account.repository";
import { ProviderLinkRequestRepository } from "../adapters/repositories/provider-link-request/provider-link-request.repository";
import { SessionRepository } from "../adapters/repositories/session/session.repository";
import { SignupSessionRepository } from "../adapters/repositories/signup-session/signup-session.repository";
import { AccountLinkReissueUseCase } from "../application/use-cases/account-link/reissue.usecase";
import { AccountLinkValidateRequestUseCase } from "../application/use-cases/account-link/validate-request.usecase";
import { AccountLinkVerifyEmailUseCase } from "../application/use-cases/account-link/verify-email.usecase";
import { EmailVerificationRequestUseCase } from "../application/use-cases/email-verification/request.usecase";
import { EmailVerificationValidateRequestUseCase } from "../application/use-cases/email-verification/validate-request.usecase";
import { EmailVerificationVerifyEmailUseCase } from "../application/use-cases/email-verification/verify-email.usecase";
import { FederatedAuthCallbackUseCase } from "../application/use-cases/federated-auth/callback.usecase";
import { FederatedAuthRequestUseCase } from "../application/use-cases/federated-auth/request.usecase";
import { federatedAuthStateSchema } from "../application/use-cases/federated-auth/schema";
import { PasswordResetRequestUseCase } from "../application/use-cases/password-reset/request.usecase";
import { PasswordResetResetUseCase } from "../application/use-cases/password-reset/reset.usecase";
import { PasswordResetValidateSessionUseCase } from "../application/use-cases/password-reset/validate-session.usecase";
import { PasswordResetVerifyEmailUseCase } from "../application/use-cases/password-reset/verify-email.usecase";
import { ProviderLinkCallbackUseCase } from "../application/use-cases/provider-link/callback.usecase";
import { ProviderLinkPrepareUseCase } from "../application/use-cases/provider-link/prepare.usecase";
import { ProviderLinkRequestUseCase } from "../application/use-cases/provider-link/request.usecase";
import { providerLinkStateSchema } from "../application/use-cases/provider-link/schema";
import { ProviderLinkUnlinkUseCase } from "../application/use-cases/provider-link/unlink.usecase";
import { ProviderLinkValidateRequestUseCase } from "../application/use-cases/provider-link/validate-request.usecase";
import { LoginUseCase } from "../application/use-cases/session/login.usecase";
import { LogoutUseCase } from "../application/use-cases/session/logout.usecase";
import { UpdatePasswordUseCase } from "../application/use-cases/session/update-password.usecase";
import { UserIdentitiesUseCase } from "../application/use-cases/session/user-identities.usecase";
import { ValidateSessionUseCase } from "../application/use-cases/session/validate-session.usecase";
import { SignupRegisterUseCase } from "../application/use-cases/signup/register.usecase";
import { SignupRequestUseCase } from "../application/use-cases/signup/request.usecase";
import { SignupValidateSessionUseCase } from "../application/use-cases/signup/validate-session.usecase";
import { SignupVerifyEmailUseCase } from "../application/use-cases/signup/verify-email.usecase";
import { UpdateEmailRequestUseCase } from "../application/use-cases/update-email/request.usecase";
import { UpdateEmailVerifyEmailUseCase } from "../application/use-cases/update-email/verify-email.usecase";
import { HmacSignedStateService } from "../infra/hmac-signed-state/hmac-signed-state.service";
import { federatedAuthRedirectURL, providerLinkRedirectURL } from "../lib/redirect-url";

import type { ICoreDIContainer } from "../../../core/di";
import type { EnvVariables } from "../../../core/infra/config/env";
import type { IAccountLinkReissueUseCase } from "../application/ports/in/account-link/reissue.usecase.interface";
import type { IAccountLinkValidateRequestUseCase } from "../application/ports/in/account-link/validate-request.usecase.interface";
import type { IAccountLinkVerifyEmailUseCase } from "../application/ports/in/account-link/verify-email.usecase.interface";
import type { IEmailVerificationRequestUseCase } from "../application/ports/in/email-verification/request.usecase.interface";
import type { IEmailVerificationValidateRequestUseCase } from "../application/ports/in/email-verification/validate-request.usecase.interface";
import type { IEmailVerificationVerifyEmailUseCase } from "../application/ports/in/email-verification/verify-email.usecase.interface";
import type { IFederatedAuthCallbackUseCase } from "../application/ports/in/federated-auth/callback.usecase.interface";
import type { IFederatedAuthRequestUseCase } from "../application/ports/in/federated-auth/request.usecase.interface";
import type { IPasswordResetRequestUseCase } from "../application/ports/in/password-reset/request.usecase.interface";
import type { IPasswordResetResetUseCase } from "../application/ports/in/password-reset/reset.usecase.interface";
import type { IPasswordResetValidateSessionUseCase } from "../application/ports/in/password-reset/validate-session.usecase.interface";
import type { IPasswordResetVerifyEmailUseCase } from "../application/ports/in/password-reset/verify-email.usecase.interface";
import type { IProviderLinkCallbackUseCase } from "../application/ports/in/provider-link/callback.usecase.interface";
import type { IProviderLinkPrepareUseCase } from "../application/ports/in/provider-link/prepare.usecase.interface";
import type { IProviderLinkRequestUseCase } from "../application/ports/in/provider-link/request.usecase.interface";
import type { IProviderLinkUnlinkUseCase } from "../application/ports/in/provider-link/unlink.usecase.interface";
import type { IProviderLinkValidateRequestUseCase } from "../application/ports/in/provider-link/validate-request.usecase.interface";
import type { ILoginUseCase } from "../application/ports/in/session/login.usecase.interface";
import type { ILogoutUseCase } from "../application/ports/in/session/logout.usecase.interface";
import type { IUpdatePasswordUseCase } from "../application/ports/in/session/update-password.usecase.interface";
import type { IUserIdentitiesUseCase } from "../application/ports/in/session/user-identities.usecase.interface";
import type { IValidateSessionUseCase } from "../application/ports/in/session/validate-session.usecase.interface";
import type { ISignupRegisterUseCase } from "../application/ports/in/signup/register.usecase.interface";
import type { ISignupRequestUseCase } from "../application/ports/in/signup/request.usecase.interface";
import type { ISignupValidateSessionUseCase } from "../application/ports/in/signup/validate-session.usecase.interface";
import type { ISignupVerifyEmailUseCase } from "../application/ports/in/signup/verify-email.usecase.interface";
import type { IUpdateEmailRequestUseCase } from "../application/ports/in/update-email/request.usecase.interface";
import type { IUpdateEmailVerifyEmailUseCase } from "../application/ports/in/update-email/verify-email.usecase.interface";
import type { IIdentityProviderGateway } from "../application/ports/out/gateways/identity-provider.gateway.interface";
import type { IHmacSignedStateService } from "../application/ports/out/infra/hmac-signed-state.service.interface";
import type { IAccountLinkRequestRepository } from "../application/ports/out/repositories/account-link-request.repository.interface";
import type { IAuthUserRepository } from "../application/ports/out/repositories/auth-user.repository.interface";
import type { IEmailVerificationRequestRepository } from "../application/ports/out/repositories/email-verification-request.repository.interface";
import type { IPasswordResetSessionRepository } from "../application/ports/out/repositories/password-reset-session.repository.interface";
import type { IProviderAccountRepository } from "../application/ports/out/repositories/provider-account.repository.interface";
import type { IProviderLinkRequestRepository } from "../application/ports/out/repositories/provider-link-request.repository.interface";
import type { ISessionRepository } from "../application/ports/out/repositories/session.repository.interface";
import type { ISignupSessionRepository } from "../application/ports/out/repositories/signup-session.repository.interface";
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
	private _federatedAuthSignedStateService: IHmacSignedStateService<typeof federatedAuthStateSchema> | undefined;
	private _providerLinkSignedStateService: IHmacSignedStateService<typeof providerLinkStateSchema> | undefined;

	// === Gateways ===
	private _federatedAuthDiscordIdentityProviderGateway: IIdentityProviderGateway | undefined;
	private _federatedAuthGoogleIdentityProviderGateway: IIdentityProviderGateway | undefined;
	private _providerLinkDiscordIdentityProviderGateway: IIdentityProviderGateway | undefined;
	private _providerLinkGoogleIdentityProviderGateway: IIdentityProviderGateway | undefined;

	// === Repositories ===
	private _accountLinkRequestRepository: IAccountLinkRequestRepository | undefined;
	private _authUserRepository: IAuthUserRepository | undefined;
	private _emailVerificationRequestRepository: IEmailVerificationRequestRepository | undefined;
	private _passwordResetSessionRepository: IPasswordResetSessionRepository | undefined;
	private _providerAccountRepository: IProviderAccountRepository | undefined;
	private _providerLinkRequestRepository: IProviderLinkRequestRepository | undefined;
	private _sessionRepository: ISessionRepository | undefined;
	private _signupSessionRepository: ISignupSessionRepository | undefined;

	// === Use Cases ===

	// Account Link
	private _accountLinkReissueUseCase: IAccountLinkReissueUseCase | undefined;
	private _accountLinkValidateRequestUseCase: IAccountLinkValidateRequestUseCase | undefined;
	private _accountLinkVerifyEmailUseCase: IAccountLinkVerifyEmailUseCase | undefined;

	// Email Verification
	private _emailVerificationRequestUseCase: IEmailVerificationRequestUseCase | undefined;
	private _emailVerificationValidateRequestUseCase: IEmailVerificationValidateRequestUseCase | undefined;
	private _emailVerificationVerifyEmailUseCase: IEmailVerificationVerifyEmailUseCase | undefined;

	// Federated Auth
	private _federatedAuthCallbackUseCase: IFederatedAuthCallbackUseCase | undefined;
	private _federatedAuthRequestUseCase: IFederatedAuthRequestUseCase | undefined;

	// Password Reset
	private _passwordResetRequestUseCase: IPasswordResetRequestUseCase | undefined;
	private _passwordResetResetUseCase: IPasswordResetResetUseCase | undefined;
	private _passwordResetValidateSessionUseCase: IPasswordResetValidateSessionUseCase | undefined;
	private _passwordResetVerifyEmailUseCase: IPasswordResetVerifyEmailUseCase | undefined;

	// Provider Link
	private _providerLinkCallbackUseCase: IProviderLinkCallbackUseCase | undefined;
	private _providerLinkPrepareUseCase: IProviderLinkPrepareUseCase | undefined;
	private _providerLinkRequestUseCase: IProviderLinkRequestUseCase | undefined;
	private _providerLinkUnlinkUseCase: IProviderLinkUnlinkUseCase | undefined;
	private _providerLinkValidateRequestUseCase: IProviderLinkValidateRequestUseCase | undefined;

	// Session
	private _loginUseCase: ILoginUseCase | undefined;
	private _logoutUseCase: ILogoutUseCase | undefined;
	private _updatePasswordUseCase: IUpdatePasswordUseCase | undefined;
	private _userIdentitiesUseCase: IUserIdentitiesUseCase | undefined;
	private _validateSessionUseCase: IValidateSessionUseCase | undefined;

	// Signup
	private _signupRegisterUseCase: ISignupRegisterUseCase | undefined;
	private _signupRequestUseCase: ISignupRequestUseCase | undefined;
	private _signupValidateSessionUseCase: ISignupValidateSessionUseCase | undefined;
	private _signupVerifyEmailUseCase: ISignupVerifyEmailUseCase | undefined;

	// Update Email
	private _updateEmailRequestUseCase: IUpdateEmailRequestUseCase | undefined;
	private _updateEmailVerifyEmailUseCase: IUpdateEmailVerifyEmailUseCase | undefined;

	constructor(envVariables: EnvVariables, coreContainer: ICoreDIContainer, override?: Partial<IAuthDIContainer>) {
		this.envVariables = envVariables;
		this.coreContainer = coreContainer;

		const overrides = override ?? {};

		// #region === Infra ===
		if (overrides.federatedAuthSignedStateService) {
			this._federatedAuthSignedStateService = overrides.federatedAuthSignedStateService;
		}
		if (overrides.providerLinkSignedStateService) {
			this._providerLinkSignedStateService = overrides.providerLinkSignedStateService;
		}
		// #endregion

		// #region === Gateways ===
		if (overrides.federatedAuthDiscordIdentityProviderGateway) {
			this._federatedAuthDiscordIdentityProviderGateway = overrides.federatedAuthDiscordIdentityProviderGateway;
		}
		if (overrides.federatedAuthGoogleIdentityProviderGateway) {
			this._federatedAuthGoogleIdentityProviderGateway = overrides.federatedAuthGoogleIdentityProviderGateway;
		}
		if (overrides.providerLinkDiscordIdentityProviderGateway) {
			this._providerLinkDiscordIdentityProviderGateway = overrides.providerLinkDiscordIdentityProviderGateway;
		}
		if (overrides.providerLinkGoogleIdentityProviderGateway) {
			this._providerLinkGoogleIdentityProviderGateway = overrides.providerLinkGoogleIdentityProviderGateway;
		}
		// #endregion

		// #region === Repositories ===
		if (overrides.accountLinkRequestRepository) {
			this._accountLinkRequestRepository = overrides.accountLinkRequestRepository;
		}
		if (overrides.authUserRepository) {
			this._authUserRepository = overrides.authUserRepository;
		}
		if (overrides.emailVerificationRequestRepository) {
			this._emailVerificationRequestRepository = overrides.emailVerificationRequestRepository;
		}
		if (overrides.passwordResetSessionRepository) {
			this._passwordResetSessionRepository = overrides.passwordResetSessionRepository;
		}
		if (overrides.providerAccountRepository) {
			this._providerAccountRepository = overrides.providerAccountRepository;
		}
		if (overrides.providerLinkRequestRepository) {
			this._providerLinkRequestRepository = overrides.providerLinkRequestRepository;
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
		if (overrides.accountLinkReissueUseCase) {
			this._accountLinkReissueUseCase = overrides.accountLinkReissueUseCase;
		}
		if (overrides.accountLinkValidateRequestUseCase) {
			this._accountLinkValidateRequestUseCase = overrides.accountLinkValidateRequestUseCase;
		}
		if (overrides.accountLinkVerifyEmailUseCase) {
			this._accountLinkVerifyEmailUseCase = overrides.accountLinkVerifyEmailUseCase;
		}

		// Email Verification
		if (overrides.emailVerificationRequestUseCase) {
			this._emailVerificationRequestUseCase = overrides.emailVerificationRequestUseCase;
		}
		if (overrides.emailVerificationValidateRequestUseCase) {
			this._emailVerificationValidateRequestUseCase = overrides.emailVerificationValidateRequestUseCase;
		}
		if (overrides.emailVerificationVerifyEmailUseCase) {
			this._emailVerificationVerifyEmailUseCase = overrides.emailVerificationVerifyEmailUseCase;
		}

		// Federated Auth
		if (overrides.federatedAuthCallbackUseCase) {
			this._federatedAuthCallbackUseCase = overrides.federatedAuthCallbackUseCase;
		}
		if (overrides.federatedAuthRequestUseCase) {
			this._federatedAuthRequestUseCase = overrides.federatedAuthRequestUseCase;
		}

		// Password Reset
		if (overrides.passwordResetRequestUseCase) {
			this._passwordResetRequestUseCase = overrides.passwordResetRequestUseCase;
		}
		if (overrides.passwordResetResetUseCase) {
			this._passwordResetResetUseCase = overrides.passwordResetResetUseCase;
		}
		if (overrides.passwordResetValidateSessionUseCase) {
			this._passwordResetValidateSessionUseCase = overrides.passwordResetValidateSessionUseCase;
		}
		if (overrides.passwordResetVerifyEmailUseCase) {
			this._passwordResetVerifyEmailUseCase = overrides.passwordResetVerifyEmailUseCase;
		}

		// Provider Link
		if (overrides.providerLinkCallbackUseCase) {
			this._providerLinkCallbackUseCase = overrides.providerLinkCallbackUseCase;
		}
		if (overrides.providerLinkPrepareUseCase) {
			this._providerLinkPrepareUseCase = overrides.providerLinkPrepareUseCase;
		}
		if (overrides.providerLinkRequestUseCase) {
			this._providerLinkRequestUseCase = overrides.providerLinkRequestUseCase;
		}
		if (overrides.providerLinkUnlinkUseCase) {
			this._providerLinkUnlinkUseCase = overrides.providerLinkUnlinkUseCase;
		}
		if (overrides.providerLinkValidateRequestUseCase) {
			this._providerLinkValidateRequestUseCase = overrides.providerLinkValidateRequestUseCase;
		}

		// Session
		if (overrides.loginUseCase) {
			this._loginUseCase = overrides.loginUseCase;
		}
		if (overrides.logoutUseCase) {
			this._logoutUseCase = overrides.logoutUseCase;
		}
		if (overrides.updatePasswordUseCase) {
			this._updatePasswordUseCase = overrides.updatePasswordUseCase;
		}
		if (overrides.userIdentitiesUseCase) {
			this._userIdentitiesUseCase = overrides.userIdentitiesUseCase;
		}
		if (overrides.validateSessionUseCase) {
			this._validateSessionUseCase = overrides.validateSessionUseCase;
		}

		// Signup
		if (overrides.signupRegisterUseCase) {
			this._signupRegisterUseCase = overrides.signupRegisterUseCase;
		}
		if (overrides.signupRequestUseCase) {
			this._signupRequestUseCase = overrides.signupRequestUseCase;
		}
		if (overrides.signupValidateSessionUseCase) {
			this._signupValidateSessionUseCase = overrides.signupValidateSessionUseCase;
		}
		if (overrides.signupVerifyEmailUseCase) {
			this._signupVerifyEmailUseCase = overrides.signupVerifyEmailUseCase;
		}

		// Update Email
		if (overrides.updateEmailRequestUseCase) {
			this._updateEmailRequestUseCase = overrides.updateEmailRequestUseCase;
		}
		if (overrides.updateEmailVerifyEmailUseCase) {
			this._updateEmailVerifyEmailUseCase = overrides.updateEmailVerifyEmailUseCase;
		}
		// #endregion
	}

	// #region === Infra ===
	get federatedAuthSignedStateService(): IHmacSignedStateService<typeof federatedAuthStateSchema> {
		if (!this._federatedAuthSignedStateService) {
			this._federatedAuthSignedStateService = new HmacSignedStateService(
				"federated-auth",
				federatedAuthStateSchema,
				this.coreContainer.hmacService,
			);
		}
		return this._federatedAuthSignedStateService;
	}

	get providerLinkSignedStateService(): IHmacSignedStateService<typeof providerLinkStateSchema> {
		if (!this._providerLinkSignedStateService) {
			this._providerLinkSignedStateService = new HmacSignedStateService(
				"provider-link",
				providerLinkStateSchema,
				this.coreContainer.hmacService,
			);
		}
		return this._providerLinkSignedStateService;
	}
	// #endregion

	// #region === Gateways ===
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

	get providerLinkDiscordIdentityProviderGateway(): IIdentityProviderGateway {
		if (!this._providerLinkDiscordIdentityProviderGateway) {
			this._providerLinkDiscordIdentityProviderGateway = new DiscordIdentityProviderGateway(
				this.envVariables.DISCORD_CLIENT_ID,
				this.envVariables.DISCORD_CLIENT_SECRET,
				providerLinkRedirectURL(this.envVariables.APP_ENV === "production", "discord"),
			);
		}
		return this._providerLinkDiscordIdentityProviderGateway;
	}

	get providerLinkGoogleIdentityProviderGateway(): IIdentityProviderGateway {
		if (!this._providerLinkGoogleIdentityProviderGateway) {
			this._providerLinkGoogleIdentityProviderGateway = new GoogleIdentityProviderGateway(
				this.envVariables.GOOGLE_CLIENT_ID,
				this.envVariables.GOOGLE_CLIENT_SECRET,
				providerLinkRedirectURL(this.envVariables.APP_ENV === "production", "google"),
			);
		}
		return this._providerLinkGoogleIdentityProviderGateway;
	}
	// #endregion

	// #region === Repositories ===
	get accountLinkRequestRepository(): IAccountLinkRequestRepository {
		if (!this._accountLinkRequestRepository) {
			this._accountLinkRequestRepository = new AccountLinkRequestRepository(this.coreContainer.drizzleService);
		}
		return this._accountLinkRequestRepository;
	}

	get authUserRepository(): IAuthUserRepository {
		if (!this._authUserRepository) {
			this._authUserRepository = new AuthUserRepository(this.coreContainer.drizzleService);
		}
		return this._authUserRepository;
	}

	get emailVerificationRequestRepository(): IEmailVerificationRequestRepository {
		if (!this._emailVerificationRequestRepository) {
			this._emailVerificationRequestRepository = new EmailVerificationRequestRepository(
				this.coreContainer.drizzleService,
			);
		}
		return this._emailVerificationRequestRepository;
	}

	get passwordResetSessionRepository(): IPasswordResetSessionRepository {
		if (!this._passwordResetSessionRepository) {
			this._passwordResetSessionRepository = new PasswordResetSessionRepository(this.coreContainer.drizzleService);
		}
		return this._passwordResetSessionRepository;
	}

	get providerAccountRepository(): IProviderAccountRepository {
		if (!this._providerAccountRepository) {
			this._providerAccountRepository = new ProviderAccountRepository(this.coreContainer.drizzleService);
		}
		return this._providerAccountRepository;
	}

	get providerLinkRequestRepository(): IProviderLinkRequestRepository {
		if (!this._providerLinkRequestRepository) {
			this._providerLinkRequestRepository = new ProviderLinkRequestRepository(this.coreContainer.drizzleService);
		}
		return this._providerLinkRequestRepository;
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
	// #endregion

	// #region === Use Cases ===

	// Account Link
	get accountLinkReissueUseCase(): IAccountLinkReissueUseCase {
		if (!this._accountLinkReissueUseCase) {
			this._accountLinkReissueUseCase = new AccountLinkReissueUseCase(
				this.coreContainer.emailGateway,
				this.accountLinkRequestRepository,
				this.coreContainer.cryptoRandomService,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._accountLinkReissueUseCase;
	}
	get accountLinkValidateRequestUseCase(): IAccountLinkValidateRequestUseCase {
		if (!this._accountLinkValidateRequestUseCase) {
			this._accountLinkValidateRequestUseCase = new AccountLinkValidateRequestUseCase(
				this.authUserRepository,
				this.accountLinkRequestRepository,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._accountLinkValidateRequestUseCase;
	}
	get accountLinkVerifyEmailUseCase(): IAccountLinkVerifyEmailUseCase {
		if (!this._accountLinkVerifyEmailUseCase) {
			this._accountLinkVerifyEmailUseCase = new AccountLinkVerifyEmailUseCase(
				this.accountLinkRequestRepository,
				this.authUserRepository,
				this.providerAccountRepository,
				this.sessionRepository,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._accountLinkVerifyEmailUseCase;
	}

	// Email Verification
	get emailVerificationRequestUseCase(): IEmailVerificationRequestUseCase {
		if (!this._emailVerificationRequestUseCase) {
			this._emailVerificationRequestUseCase = new EmailVerificationRequestUseCase(
				this.coreContainer.emailGateway,
				this.emailVerificationRequestRepository,
				this.coreContainer.cryptoRandomService,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._emailVerificationRequestUseCase;
	}
	get emailVerificationValidateRequestUseCase(): IEmailVerificationValidateRequestUseCase {
		if (!this._emailVerificationValidateRequestUseCase) {
			this._emailVerificationValidateRequestUseCase = new EmailVerificationValidateRequestUseCase(
				this.emailVerificationRequestRepository,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._emailVerificationValidateRequestUseCase;
	}
	get emailVerificationVerifyEmailUseCase(): IEmailVerificationVerifyEmailUseCase {
		if (!this._emailVerificationVerifyEmailUseCase) {
			this._emailVerificationVerifyEmailUseCase = new EmailVerificationVerifyEmailUseCase(
				this.authUserRepository,
				this.emailVerificationRequestRepository,
			);
		}
		return this._emailVerificationVerifyEmailUseCase;
	}

	// Federated Auth
	get federatedAuthCallbackUseCase(): IFederatedAuthCallbackUseCase {
		if (!this._federatedAuthCallbackUseCase) {
			this._federatedAuthCallbackUseCase = new FederatedAuthCallbackUseCase(
				this.federatedAuthDiscordIdentityProviderGateway,
				this.federatedAuthGoogleIdentityProviderGateway,
				this.accountLinkRequestRepository,
				this.authUserRepository,
				this.providerAccountRepository,
				this.sessionRepository,
				this.federatedAuthSignedStateService,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._federatedAuthCallbackUseCase;
	}
	get federatedAuthRequestUseCase(): IFederatedAuthRequestUseCase {
		if (!this._federatedAuthRequestUseCase) {
			this._federatedAuthRequestUseCase = new FederatedAuthRequestUseCase(
				this.federatedAuthDiscordIdentityProviderGateway,
				this.federatedAuthGoogleIdentityProviderGateway,
				this.federatedAuthSignedStateService,
			);
		}
		return this._federatedAuthRequestUseCase;
	}

	// Password Reset
	get passwordResetRequestUseCase(): IPasswordResetRequestUseCase {
		if (!this._passwordResetRequestUseCase) {
			this._passwordResetRequestUseCase = new PasswordResetRequestUseCase(
				this.authUserRepository,
				this.passwordResetSessionRepository,
				this.coreContainer.cryptoRandomService,
				this.coreContainer.emailGateway,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._passwordResetRequestUseCase;
	}
	get passwordResetResetUseCase(): IPasswordResetResetUseCase {
		if (!this._passwordResetResetUseCase) {
			this._passwordResetResetUseCase = new PasswordResetResetUseCase(
				this.authUserRepository,
				this.passwordResetSessionRepository,
				this.sessionRepository,
				this.coreContainer.passwordHashingService,
			);
		}
		return this._passwordResetResetUseCase;
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
	get passwordResetVerifyEmailUseCase(): IPasswordResetVerifyEmailUseCase {
		if (!this._passwordResetVerifyEmailUseCase) {
			this._passwordResetVerifyEmailUseCase = new PasswordResetVerifyEmailUseCase(this.passwordResetSessionRepository);
		}
		return this._passwordResetVerifyEmailUseCase;
	}

	// Provider Link
	get providerLinkCallbackUseCase(): IProviderLinkCallbackUseCase {
		if (!this._providerLinkCallbackUseCase) {
			this._providerLinkCallbackUseCase = new ProviderLinkCallbackUseCase(
				this.providerLinkDiscordIdentityProviderGateway,
				this.providerLinkGoogleIdentityProviderGateway,
				this.providerAccountRepository,
				this.providerLinkSignedStateService,
			);
		}
		return this._providerLinkCallbackUseCase;
	}
	get providerLinkPrepareUseCase(): IProviderLinkPrepareUseCase {
		if (!this._providerLinkPrepareUseCase) {
			this._providerLinkPrepareUseCase = new ProviderLinkPrepareUseCase(
				this.providerLinkRequestRepository,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._providerLinkPrepareUseCase;
	}
	get providerLinkRequestUseCase(): IProviderLinkRequestUseCase {
		if (!this._providerLinkRequestUseCase) {
			this._providerLinkRequestUseCase = new ProviderLinkRequestUseCase(
				this.providerLinkDiscordIdentityProviderGateway,
				this.providerLinkGoogleIdentityProviderGateway,
				this.providerLinkSignedStateService,
			);
		}
		return this._providerLinkRequestUseCase;
	}
	get providerLinkUnlinkUseCase(): IProviderLinkUnlinkUseCase {
		if (!this._providerLinkUnlinkUseCase) {
			this._providerLinkUnlinkUseCase = new ProviderLinkUnlinkUseCase(this.providerAccountRepository);
		}
		return this._providerLinkUnlinkUseCase;
	}
	get providerLinkValidateRequestUseCase(): IProviderLinkValidateRequestUseCase {
		if (!this._providerLinkValidateRequestUseCase) {
			this._providerLinkValidateRequestUseCase = new ProviderLinkValidateRequestUseCase(
				this.authUserRepository,
				this.providerLinkRequestRepository,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._providerLinkValidateRequestUseCase;
	}

	// Session
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
	get userIdentitiesUseCase(): IUserIdentitiesUseCase {
		if (!this._userIdentitiesUseCase) {
			this._userIdentitiesUseCase = new UserIdentitiesUseCase(this.providerAccountRepository);
		}
		return this._userIdentitiesUseCase;
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
	get signupRegisterUseCase(): ISignupRegisterUseCase {
		if (!this._signupRegisterUseCase) {
			this._signupRegisterUseCase = new SignupRegisterUseCase(
				this.authUserRepository,
				this.sessionRepository,
				this.signupSessionRepository,
				this.coreContainer.tokenSecretService,
				this.coreContainer.passwordHashingService,
			);
		}
		return this._signupRegisterUseCase;
	}
	get signupRequestUseCase(): ISignupRequestUseCase {
		if (!this._signupRequestUseCase) {
			this._signupRequestUseCase = new SignupRequestUseCase(
				this.coreContainer.emailGateway,
				this.authUserRepository,
				this.signupSessionRepository,
				this.coreContainer.cryptoRandomService,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._signupRequestUseCase;
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
	get signupVerifyEmailUseCase(): ISignupVerifyEmailUseCase {
		if (!this._signupVerifyEmailUseCase) {
			this._signupVerifyEmailUseCase = new SignupVerifyEmailUseCase(this.signupSessionRepository);
		}
		return this._signupVerifyEmailUseCase;
	}

	// Update Email
	get updateEmailRequestUseCase(): IUpdateEmailRequestUseCase {
		if (!this._updateEmailRequestUseCase) {
			this._updateEmailRequestUseCase = new UpdateEmailRequestUseCase(
				this.emailVerificationRequestRepository,
				this.authUserRepository,
				this.coreContainer.cryptoRandomService,
				this.coreContainer.tokenSecretService,
				this.coreContainer.emailGateway,
			);
		}
		return this._updateEmailRequestUseCase;
	}
	get updateEmailVerifyEmailUseCase(): IUpdateEmailVerifyEmailUseCase {
		if (!this._updateEmailVerifyEmailUseCase) {
			this._updateEmailVerifyEmailUseCase = new UpdateEmailVerifyEmailUseCase(
				this.authUserRepository,
				this.sessionRepository,
				this.emailVerificationRequestRepository,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._updateEmailVerifyEmailUseCase;
	}

	// #endregion
}
