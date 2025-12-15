import { DiscordIdentityProviderGateway } from "../adapters/gateways/identity-provider/discord.gateway";
import { GoogleIdentityProviderGateway } from "../adapters/gateways/identity-provider/google.gateway";
import { AuthUserRepository } from "../adapters/repositories/auth-user/auth-user.repository";
import { EmailVerificationRequestRepository } from "../adapters/repositories/email-verification-request/email-verification-request.repository";
import { PasswordResetSessionRepository } from "../adapters/repositories/password-reset-session/password-reset-session.repository";
import { ProviderAccountRepository } from "../adapters/repositories/provider-account/provider-account.repository";
import { ProviderLinkProposalRepository } from "../adapters/repositories/provider-link-proposal/provider-link-proposal.repository";
import { ProviderLinkRequestRepository } from "../adapters/repositories/provider-link-request/provider-link-request.repository";
import { SessionRepository } from "../adapters/repositories/session/session.repository";
import { SignupSessionRepository } from "../adapters/repositories/signup-session/signup-session.repository";
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
import { ProviderLinkProposalReissueUseCase } from "../application/use-cases/provider-link/proposal-reissue.usecase";
import { ProviderLinkProposalVerifyEmailUseCase } from "../application/use-cases/provider-link/proposal-verify-email.usecase";
import { ProviderLinkRequestUseCase } from "../application/use-cases/provider-link/request.usecase";
import { providerLinkStateSchema } from "../application/use-cases/provider-link/schema";
import { ProviderLinkUnlinkUseCase } from "../application/use-cases/provider-link/unlink.usecase";
import { ProviderLinkValidateProposalUseCase } from "../application/use-cases/provider-link/validate-proposal.usecase";
import { ProviderLinkValidateRequestUseCase } from "../application/use-cases/provider-link/validate-request.usecase";
import { ListAuthMethodsUseCase } from "../application/use-cases/session/list-auth-methods.usecase";
import { LoginUseCase } from "../application/use-cases/session/login.usecase";
import { LogoutUseCase } from "../application/use-cases/session/logout.usecase";
import { UpdatePasswordUseCase } from "../application/use-cases/session/update-password.usecase";
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
import type { IEmailVerificationRequestUseCase } from "../application/contracts/email-verification/request.usecase.interface";
import type { IEmailVerificationValidateRequestUseCase } from "../application/contracts/email-verification/validate-request.usecase.interface";
import type { IEmailVerificationVerifyEmailUseCase } from "../application/contracts/email-verification/verify-email.usecase.interface";
import type { IFederatedAuthCallbackUseCase } from "../application/contracts/federated-auth/callback.usecase.interface";
import type { IFederatedAuthRequestUseCase } from "../application/contracts/federated-auth/request.usecase.interface";
import type { IPasswordResetRequestUseCase } from "../application/contracts/password-reset/request.usecase.interface";
import type { IPasswordResetResetUseCase } from "../application/contracts/password-reset/reset.usecase.interface";
import type { IPasswordResetValidateSessionUseCase } from "../application/contracts/password-reset/validate-session.usecase.interface";
import type { IPasswordResetVerifyEmailUseCase } from "../application/contracts/password-reset/verify-email.usecase.interface";
import type { IProviderLinkCallbackUseCase } from "../application/contracts/provider-link/callback.usecase.interface";
import type { IProviderLinkPrepareUseCase } from "../application/contracts/provider-link/prepare.usecase.interface";
import type { IProviderLinkProposalReissueUseCase } from "../application/contracts/provider-link/proposal-reissue.usecase.interface";
import type { IProviderLinkProposalVerifyEmailUseCase } from "../application/contracts/provider-link/proposal-verify-email.usecase.interface";
import type { IProviderLinkRequestUseCase } from "../application/contracts/provider-link/request.usecase.interface";
import type { IProviderLinkUnlinkUseCase } from "../application/contracts/provider-link/unlink.usecase.interface";
import type { IProviderLinkValidateProposalUseCase } from "../application/contracts/provider-link/validate-proposal.usecase.interface";
import type { IProviderLinkValidateRequestUseCase } from "../application/contracts/provider-link/validate-request.usecase.interface";
import type { IListAuthMethodsUseCase } from "../application/contracts/session/list-auth-methods.usecase.interface";
import type { ILoginUseCase } from "../application/contracts/session/login.usecase.interface";
import type { ILogoutUseCase } from "../application/contracts/session/logout.usecase.interface";
import type { IUpdatePasswordUseCase } from "../application/contracts/session/update-password.usecase.interface";
import type { IValidateSessionUseCase } from "../application/contracts/session/validate-session.usecase.interface";
import type { ISignupRegisterUseCase } from "../application/contracts/signup/register.usecase.interface";
import type { ISignupRequestUseCase } from "../application/contracts/signup/request.usecase.interface";
import type { ISignupValidateSessionUseCase } from "../application/contracts/signup/validate-session.usecase.interface";
import type { ISignupVerifyEmailUseCase } from "../application/contracts/signup/verify-email.usecase.interface";
import type { IUpdateEmailRequestUseCase } from "../application/contracts/update-email/request.usecase.interface";
import type { IUpdateEmailVerifyEmailUseCase } from "../application/contracts/update-email/verify-email.usecase.interface";
import type { IIdentityProviderGateway } from "../application/ports/gateways/identity-provider.gateway.interface";
import type { IHmacSignedStateService } from "../application/ports/infra/hmac-signed-state.service.interface";
import type { IAuthUserRepository } from "../application/ports/repositories/auth-user.repository.interface";
import type { IEmailVerificationRequestRepository } from "../application/ports/repositories/email-verification-request.repository.interface";
import type { IPasswordResetSessionRepository } from "../application/ports/repositories/password-reset-session.repository.interface";
import type { IProviderAccountRepository } from "../application/ports/repositories/provider-account.repository.interface";
import type { IProviderLinkProposalRepository } from "../application/ports/repositories/provider-link-proposal.repository.interface";
import type { IProviderLinkRequestRepository } from "../application/ports/repositories/provider-link-request.repository.interface";
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
	private _providerLinkSignedStateService: IHmacSignedStateService<typeof providerLinkStateSchema> | undefined;
	private _federatedAuthSignedStateService: IHmacSignedStateService<typeof federatedAuthStateSchema> | undefined;

	// === Gateways ===
	private _providerLinkGoogleIdentityProviderGateway: IIdentityProviderGateway | undefined;
	private _providerLinkDiscordIdentityProviderGateway: IIdentityProviderGateway | undefined;
	private _federatedAuthDiscordIdentityProviderGateway: IIdentityProviderGateway | undefined;
	private _federatedAuthGoogleIdentityProviderGateway: IIdentityProviderGateway | undefined;

	// === Repositories ===
	private _providerLinkProposalRepository: IProviderLinkProposalRepository | undefined;
	private _authUserRepository: IAuthUserRepository | undefined;
	private _emailVerificationRequestRepository: IEmailVerificationRequestRepository | undefined;
	private _passwordResetSessionRepository: IPasswordResetSessionRepository | undefined;
	private _providerAccountRepository: IProviderAccountRepository | undefined;
	private _providerLinkRequestRepository: IProviderLinkRequestRepository | undefined;
	private _sessionRepository: ISessionRepository | undefined;
	private _signupSessionRepository: ISignupSessionRepository | undefined;

	// === Use Cases ===

	// Email Verification
	private _emailVerificationVerifyEmailUseCase: IEmailVerificationVerifyEmailUseCase | undefined;
	private _emailVerificationRequestUseCase: IEmailVerificationRequestUseCase | undefined;
	private _emailVerificationValidateRequestUseCase: IEmailVerificationValidateRequestUseCase | undefined;

	// Federated Auth
	private _federatedAuthCallbackUseCase: IFederatedAuthCallbackUseCase | undefined;
	private _federatedAuthRequestUseCase: IFederatedAuthRequestUseCase | undefined;

	// Password Reset
	private _passwordResetResetUseCase: IPasswordResetResetUseCase | undefined;
	private _passwordResetRequestUseCase: IPasswordResetRequestUseCase | undefined;
	private _passwordResetVerifyEmailUseCase: IPasswordResetVerifyEmailUseCase | undefined;
	private _passwordResetValidateSessionUseCase: IPasswordResetValidateSessionUseCase | undefined;

	// Provider Link
	private _providerLinkCallbackUseCase: IProviderLinkCallbackUseCase | undefined;
	private _providerLinkUnlinkUseCase: IProviderLinkUnlinkUseCase | undefined;
	private _providerLinkRequestUseCase: IProviderLinkRequestUseCase | undefined;
	private _providerLinkPrepareUseCase: IProviderLinkPrepareUseCase | undefined;
	private _providerLinkValidateRequestUseCase: IProviderLinkValidateRequestUseCase | undefined;
	private _providerLinkProposalReissueUseCase: IProviderLinkProposalReissueUseCase | undefined;
	private _providerLinkValidateProposalUseCase: IProviderLinkValidateProposalUseCase | undefined;
	private _providerLinkProposalVerifyEmailUseCase: IProviderLinkProposalVerifyEmailUseCase | undefined;

	// Session
	private _listAuthMethodsUseCase: IListAuthMethodsUseCase | undefined;
	private _loginUseCase: ILoginUseCase | undefined;
	private _logoutUseCase: ILogoutUseCase | undefined;
	private _updatePasswordUseCase: IUpdatePasswordUseCase | undefined;
	private _validateSessionUseCase: IValidateSessionUseCase | undefined;

	// Signup
	private _signupRegisterUseCase: ISignupRegisterUseCase | undefined;
	private _signupRequestUseCase: ISignupRequestUseCase | undefined;
	private _signupVerifyEmailUseCase: ISignupVerifyEmailUseCase | undefined;
	private _signupValidateSessionUseCase: ISignupValidateSessionUseCase | undefined;

	// Update Email
	private _updateEmailVerifyEmailUseCase: IUpdateEmailVerifyEmailUseCase | undefined;
	private _updateEmailRequestUseCase: IUpdateEmailRequestUseCase | undefined;

	constructor(envVariables: EnvVariables, coreContainer: ICoreDIContainer, override?: Partial<IAuthDIContainer>) {
		this.envVariables = envVariables;

		this.coreContainer = coreContainer;

		const overrides = override ?? {};

		// #region === Infra ===
		if (overrides.providerLinkSignedStateService) {
			this._providerLinkSignedStateService = overrides.providerLinkSignedStateService;
		}
		if (overrides.federatedAuthSignedStateService) {
			this._federatedAuthSignedStateService = overrides.federatedAuthSignedStateService;
		}
		// #endregion

		// #region === Gateways ===
		if (overrides.providerLinkGoogleIdentityProviderGateway) {
			this._providerLinkGoogleIdentityProviderGateway = overrides.providerLinkGoogleIdentityProviderGateway;
		}
		if (overrides.providerLinkDiscordIdentityProviderGateway) {
			this._providerLinkDiscordIdentityProviderGateway = overrides.providerLinkDiscordIdentityProviderGateway;
		}
		if (overrides.federatedAuthDiscordIdentityProviderGateway) {
			this._federatedAuthDiscordIdentityProviderGateway = overrides.federatedAuthDiscordIdentityProviderGateway;
		}
		if (overrides.federatedAuthGoogleIdentityProviderGateway) {
			this._federatedAuthGoogleIdentityProviderGateway = overrides.federatedAuthGoogleIdentityProviderGateway;
		}
		// #endregion

		// #region === Repositories ===
		if (overrides.providerLinkProposalRepository) {
			this._providerLinkProposalRepository = overrides.providerLinkProposalRepository;
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

		// Email Verification
		if (overrides.emailVerificationVerifyEmailUseCase) {
			this._emailVerificationVerifyEmailUseCase = overrides.emailVerificationVerifyEmailUseCase;
		}
		if (overrides.emailVerificationRequestUseCase) {
			this._emailVerificationRequestUseCase = overrides.emailVerificationRequestUseCase;
		}
		if (overrides.emailVerificationValidateRequestUseCase) {
			this._emailVerificationValidateRequestUseCase = overrides.emailVerificationValidateRequestUseCase;
		}

		// Federated Auth
		if (overrides.federatedAuthCallbackUseCase) {
			this._federatedAuthCallbackUseCase = overrides.federatedAuthCallbackUseCase;
		}
		if (overrides.federatedAuthRequestUseCase) {
			this._federatedAuthRequestUseCase = overrides.federatedAuthRequestUseCase;
		}

		// Password Reset
		if (overrides.passwordResetResetUseCase) {
			this._passwordResetResetUseCase = overrides.passwordResetResetUseCase;
		}
		if (overrides.passwordResetRequestUseCase) {
			this._passwordResetRequestUseCase = overrides.passwordResetRequestUseCase;
		}
		if (overrides.passwordResetVerifyEmailUseCase) {
			this._passwordResetVerifyEmailUseCase = overrides.passwordResetVerifyEmailUseCase;
		}
		if (overrides.passwordResetValidateSessionUseCase) {
			this._passwordResetValidateSessionUseCase = overrides.passwordResetValidateSessionUseCase;
		}

		// Provider Link
		if (overrides.providerLinkCallbackUseCase) {
			this._providerLinkCallbackUseCase = overrides.providerLinkCallbackUseCase;
		}
		if (overrides.providerLinkUnlinkUseCase) {
			this._providerLinkUnlinkUseCase = overrides.providerLinkUnlinkUseCase;
		}
		if (overrides.providerLinkRequestUseCase) {
			this._providerLinkRequestUseCase = overrides.providerLinkRequestUseCase;
		}
		if (overrides.providerLinkPrepareUseCase) {
			this._providerLinkPrepareUseCase = overrides.providerLinkPrepareUseCase;
		}
		if (overrides.providerLinkValidateRequestUseCase) {
			this._providerLinkValidateRequestUseCase = overrides.providerLinkValidateRequestUseCase;
		}
		if (overrides.providerLinkProposalReissueUseCase) {
			this._providerLinkProposalReissueUseCase = overrides.providerLinkProposalReissueUseCase;
		}
		if (overrides.providerLinkValidateProposalUseCase) {
			this._providerLinkValidateProposalUseCase = overrides.providerLinkValidateProposalUseCase;
		}
		if (overrides.providerLinkProposalVerifyEmailUseCase) {
			this._providerLinkProposalVerifyEmailUseCase = overrides.providerLinkProposalVerifyEmailUseCase;
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
		if (overrides.signupRegisterUseCase) {
			this._signupRegisterUseCase = overrides.signupRegisterUseCase;
		}
		if (overrides.signupRequestUseCase) {
			this._signupRequestUseCase = overrides.signupRequestUseCase;
		}
		if (overrides.signupVerifyEmailUseCase) {
			this._signupVerifyEmailUseCase = overrides.signupVerifyEmailUseCase;
		}
		if (overrides.signupValidateSessionUseCase) {
			this._signupValidateSessionUseCase = overrides.signupValidateSessionUseCase;
		}

		// Update Email
		if (overrides.updateEmailVerifyEmailUseCase) {
			this._updateEmailVerifyEmailUseCase = overrides.updateEmailVerifyEmailUseCase;
		}
		if (overrides.updateEmailRequestUseCase) {
			this._updateEmailRequestUseCase = overrides.updateEmailRequestUseCase;
		}
		// #endregion
	}

	// #region === Infra ===
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
	// #endregion

	// #region === Gateways ===
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

	get emailVerificationRequestRepository(): IEmailVerificationRequestRepository {
		if (!this._emailVerificationRequestRepository) {
			this._emailVerificationRequestRepository = new EmailVerificationRequestRepository(
				this.coreContainer.drizzleService,
			);
		}
		return this._emailVerificationRequestRepository;
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

	get providerLinkProposalRepository(): IProviderLinkProposalRepository {
		if (!this._providerLinkProposalRepository) {
			this._providerLinkProposalRepository = new ProviderLinkProposalRepository(this.coreContainer.drizzleService);
		}
		return this._providerLinkProposalRepository;
	}
	// #endregion

	// #region === Use Cases ===

	// Email Verification
	get emailVerificationVerifyEmailUseCase(): IEmailVerificationVerifyEmailUseCase {
		if (!this._emailVerificationVerifyEmailUseCase) {
			this._emailVerificationVerifyEmailUseCase = new EmailVerificationVerifyEmailUseCase(
				this.authUserRepository,
				this.emailVerificationRequestRepository,
			);
		}
		return this._emailVerificationVerifyEmailUseCase;
	}
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

	// Federated Auth
	get federatedAuthCallbackUseCase(): IFederatedAuthCallbackUseCase {
		if (!this._federatedAuthCallbackUseCase) {
			this._federatedAuthCallbackUseCase = new FederatedAuthCallbackUseCase(
				this.federatedAuthDiscordIdentityProviderGateway,
				this.federatedAuthGoogleIdentityProviderGateway,
				this.providerLinkProposalRepository,
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
	get providerLinkUnlinkUseCase(): IProviderLinkUnlinkUseCase {
		if (!this._providerLinkUnlinkUseCase) {
			this._providerLinkUnlinkUseCase = new ProviderLinkUnlinkUseCase(this.providerAccountRepository);
		}
		return this._providerLinkUnlinkUseCase;
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
	get providerLinkPrepareUseCase(): IProviderLinkPrepareUseCase {
		if (!this._providerLinkPrepareUseCase) {
			this._providerLinkPrepareUseCase = new ProviderLinkPrepareUseCase(
				this.providerLinkRequestRepository,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._providerLinkPrepareUseCase;
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
	get providerLinkProposalReissueUseCase(): IProviderLinkProposalReissueUseCase {
		if (!this._providerLinkProposalReissueUseCase) {
			this._providerLinkProposalReissueUseCase = new ProviderLinkProposalReissueUseCase(
				this.coreContainer.emailGateway,
				this.providerLinkProposalRepository,
				this.coreContainer.cryptoRandomService,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._providerLinkProposalReissueUseCase;
	}
	get providerLinkValidateProposalUseCase(): IProviderLinkValidateProposalUseCase {
		if (!this._providerLinkValidateProposalUseCase) {
			this._providerLinkValidateProposalUseCase = new ProviderLinkValidateProposalUseCase(
				this.authUserRepository,
				this.providerLinkProposalRepository,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._providerLinkValidateProposalUseCase;
	}
	get providerLinkProposalVerifyEmailUseCase(): IProviderLinkProposalVerifyEmailUseCase {
		if (!this._providerLinkProposalVerifyEmailUseCase) {
			this._providerLinkProposalVerifyEmailUseCase = new ProviderLinkProposalVerifyEmailUseCase(
				this.providerLinkProposalRepository,
				this.authUserRepository,
				this.providerAccountRepository,
				this.sessionRepository,
				this.coreContainer.tokenSecretService,
			);
		}
		return this._providerLinkProposalVerifyEmailUseCase;
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

	// #endregion
}
