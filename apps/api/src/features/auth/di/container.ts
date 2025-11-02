import { createDiscordGateways } from "../adapters/gateways/oauth-provider/discord.gateway";
import { createGoogleGateways } from "../adapters/gateways/oauth-provider/google.gateway";
import { AccountAssociationSessionRepository } from "../adapters/repositories/account-association-session/account-association-session.repository";
import { AccountLinkSessionRepository } from "../adapters/repositories/account-link-session/account-link-session.repository";
import { AuthUserRepository } from "../adapters/repositories/auth-user/auth-user.repository";
import { EmailVerificationSessionRepository } from "../adapters/repositories/email-verification-session/email-verification-session.repository";
import { ExternalIdentityRepository } from "../adapters/repositories/external-identity/external-identity.repository";
import { PasswordResetSessionRepository } from "../adapters/repositories/password-reset-session/password-reset-session.repository";
import { SessionRepository } from "../adapters/repositories/session/session.repository";
import { SignupSessionRepository } from "../adapters/repositories/signup-session/signup-session.repository";
import { HmacOAuthStateSigner } from "../application/infra/hmac-oauth-state-signer/hmac-oauth-state-signer";
import { AccountAssociationChallengeUseCase } from "../application/use-cases/account-association/account-association-challenge.usecase";
import { AccountAssociationConfirmUseCase } from "../application/use-cases/account-association/account-association-confirm.usecase";
import { ValidateAccountAssociationSessionUseCase } from "../application/use-cases/account-association/validate-account-association-session.usecase";
import { GetConnectionsUseCase } from "../application/use-cases/account-connection/get-connections.usecase";
import { UnlinkAccountConnectionUseCase } from "../application/use-cases/account-connection/unlink-account-connection.usecase";
import { AccountLinkCallbackUseCase } from "../application/use-cases/account-link/account-link-callback.usecase";
import { AccountLinkPrepareUseCase } from "../application/use-cases/account-link/account-link-prepare.usecase";
import { AccountLinkRequestUseCase } from "../application/use-cases/account-link/account-link-request.usecase";
import { accountLinkStateSchema } from "../application/use-cases/account-link/schema";
import { LoginUseCase } from "../application/use-cases/basic-auth/login.usecase";
import { LogoutUseCase } from "../application/use-cases/basic-auth/logout.usecase";
import { SignupConfirmUseCase } from "../application/use-cases/basic-auth/signup-confirm.usecase";
import { SignupRequestUseCase } from "../application/use-cases/basic-auth/signup-request.usecase";
import { SignupVerifyEmailUseCase } from "../application/use-cases/basic-auth/signup-verify-email.usecase";
import { ValidateSessionUseCase } from "../application/use-cases/basic-auth/validate-session.usecase";
import { ValidateSignupSessionUseCase } from "../application/use-cases/basic-auth/validate-signup-session.usecase";
import { EmailVerificationConfirmUseCase } from "../application/use-cases/email/email-verification-confirm.usecase";
import { EmailVerificationRequestUseCase } from "../application/use-cases/email/email-verification-request.usecase";
import { UpdateEmailConfirmUseCase } from "../application/use-cases/email/update-email-confirm.usecase";
import { UpdateEmailRequestUseCase } from "../application/use-cases/email/update-email-request.usecase";
import { ValidateEmailVerificationSessionUseCase } from "../application/use-cases/email/validate-email-verification-session.usecase";
import { ExternalAuthLoginCallbackUseCase } from "../application/use-cases/external-auth/external-auth-login-callback.usecase";
import { ExternalAuthRequestUseCase } from "../application/use-cases/external-auth/external-auth-request.usecase";
import { ExternalAuthSignupCallbackUseCase } from "../application/use-cases/external-auth/external-auth-signup-callback.usecase";
import { oauthStateSchema } from "../application/use-cases/external-auth/schema";
import { PasswordResetRequestUseCase } from "../application/use-cases/password/password-reset-request.usecase";
import { PasswordResetVerifyEmailUseCase } from "../application/use-cases/password/password-reset-verify-email.usecase";
import { ResetPasswordUseCase } from "../application/use-cases/password/reset-password.usecase";
import { UpdatePasswordUseCase } from "../application/use-cases/password/update-password.usecase";
import { ValidatePasswordResetSessionUseCase } from "../application/use-cases/password/validate-password-reset-session.usecase";

import type { ICoreDIContainer } from "../../../core/di/container";
import type { EnvVariables } from "../../../core/infra/config/env";
import type { ProviderGateways } from "../adapters/gateways/oauth-provider/type";
import type { IAccountAssociationChallengeUseCase } from "../application/contracts/account-association/account-association-challenge.usecase.interface";
import type { IAccountAssociationConfirmUseCase } from "../application/contracts/account-association/account-association-confirm.usecase.interface";
import type { IValidateAccountAssociationSessionUseCase } from "../application/contracts/account-association/validate-account-association-session.usecase.interface";
import type { IGetConnectionsUseCase } from "../application/contracts/account-connection/get-connections.usecase.interface";
import type { IUnlinkAccountConnectionUseCase } from "../application/contracts/account-connection/unlink-account-connection.usecase.interface";
import type { IAccountLinkCallbackUseCase } from "../application/contracts/account-link/account-link-callback.usecase.interface";
import type { IAccountLinkPrepareUseCase } from "../application/contracts/account-link/account-link-prepare.usecase.interface";
import type { IAccountLinkRequestUseCase } from "../application/contracts/account-link/account-link-request.usecase.interface";
import type { ILoginUseCase } from "../application/contracts/basic-auth/login.usecase.interface";
import type { ILogoutUseCase } from "../application/contracts/basic-auth/logout.usecase.interface";
import type { ISignupConfirmUseCase } from "../application/contracts/basic-auth/signup-confirm.usecase.interface";
import type { ISignupRequestUseCase } from "../application/contracts/basic-auth/signup-request.usecase.interface";
import type { ISignupVerifyEmailUseCase } from "../application/contracts/basic-auth/signup-verify-email.usecase.interface";
import type { IValidateSessionUseCase } from "../application/contracts/basic-auth/validate-session.usecase";
import type { IValidateSignupSessionUseCase } from "../application/contracts/basic-auth/validate-signup-session.usecase.interface";
import type { IEmailVerificationConfirmUseCase } from "../application/contracts/email/email-verification-confirm.usecase.interface";
import type { IEmailVerificationRequestUseCase } from "../application/contracts/email/email-verification-request.usecase.interface";
import type { IUpdateEmailConfirmUseCase } from "../application/contracts/email/update-email-confirm.usecase.interface";
import type { IUpdateEmailRequestUseCase } from "../application/contracts/email/update-email-request.usecase.interface";
import type { IValidateEmailVerificationSessionUseCase } from "../application/contracts/email/validate-email-verification-session.usecase.interface";
import type { IExternalAuthLoginCallbackUseCase } from "../application/contracts/external-auth/external-auth-login-callback.usecase.interface";
import type { IExternalAuthRequestUseCase } from "../application/contracts/external-auth/external-auth-request.usecase.interface";
import type { IExternalAuthSignupCallbackUseCase } from "../application/contracts/external-auth/external-auth-signup-callback.usecase.interface";
import type { IPasswordResetRequestUseCase } from "../application/contracts/password/password-reset-request.usecase.interface";
import type { IPasswordResetVerifyEmailUseCase } from "../application/contracts/password/password-reset-verify-email.usecase.interface";
import type { IResetPasswordUseCase } from "../application/contracts/password/reset-password.usecase.interface";
import type { IUpdatePasswordUseCase } from "../application/contracts/password/update-password.usecase.interface";
import type { IValidatePasswordResetSessionUseCase } from "../application/contracts/password/validate-password-reset-session.usecase.interface";
import type { IHmacOAuthStateSigner } from "../application/ports/infra/hmac-oauth-state-signer.interface";
import type { IAccountAssociationSessionRepository } from "../application/ports/repositories/account-association-session.repository.interface";
import type { IAccountLinkSessionRepository } from "../application/ports/repositories/account-link-session.repository.interface";
import type { IAuthUserRepository } from "../application/ports/repositories/auth-user.repository.interface";
import type { IEmailVerificationSessionRepository } from "../application/ports/repositories/email-verification-session.repository.interface";
import type { IExternalIdentityRepository } from "../application/ports/repositories/external-identity.repository.interface";
import type { IPasswordResetSessionRepository } from "../application/ports/repositories/password-reset-session.repository.interface";
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

	// Infra
	private _accountLinkOAuthStateSigner: IHmacOAuthStateSigner<typeof accountLinkStateSchema> | undefined;
	private _externalAuthOAuthStateSigner: IHmacOAuthStateSigner<typeof oauthStateSchema> | undefined;

	// Gateways
	private _googleOAuthGateways: ProviderGateways | undefined;
	private _discordOAuthGateways: ProviderGateways | undefined;

	// Repositories
	private _accountAssociationSessionRepository: IAccountAssociationSessionRepository | undefined;
	private _accountLinkSessionRepository: IAccountLinkSessionRepository | undefined;
	private _authUserRepository: IAuthUserRepository | undefined;
	private _sessionRepository: ISessionRepository | undefined;
	private _signupSessionRepository: ISignupSessionRepository | undefined;
	private _passwordResetSessionRepository: IPasswordResetSessionRepository | undefined;
	private _emailVerificationSessionRepository: IEmailVerificationSessionRepository | undefined;
	private _externalIdentityRepository: IExternalIdentityRepository | undefined;

	// Use Cases
	private _accountAssociationChallengeUseCase: IAccountAssociationChallengeUseCase | undefined;
	private _accountAssociationConfirmUseCase: IAccountAssociationConfirmUseCase | undefined;
	private _validateAccountAssociationSessionUseCase: IValidateAccountAssociationSessionUseCase | undefined;

	private _accountLinkCallbackUseCase: IAccountLinkCallbackUseCase | undefined;
	private _accountLinkRequestUseCase: IAccountLinkRequestUseCase | undefined;
	private _accountLinkPrepareUseCase: IAccountLinkPrepareUseCase | undefined;

	private _getConnectionsUseCase: IGetConnectionsUseCase | undefined;
	private _unlinkAccountConnectionUseCase: IUnlinkAccountConnectionUseCase | undefined;

	private _loginUseCase: ILoginUseCase | undefined;
	private _logoutUseCase: ILogoutUseCase | undefined;
	private _signupRequestUseCase: ISignupRequestUseCase | undefined;
	private _signupConfirmUseCase: ISignupConfirmUseCase | undefined;
	private _signupVerifyEmailUseCase: ISignupVerifyEmailUseCase | undefined;
	private _validateSessionUseCase: IValidateSessionUseCase | undefined;
	private _validateSignupSessionUseCase: IValidateSignupSessionUseCase | undefined;

	private _emailVerificationConfirmUseCase: IEmailVerificationConfirmUseCase | undefined;
	private _emailVerificationRequestUseCase: IEmailVerificationRequestUseCase | undefined;
	private _updateEmailConfirmUseCase: IUpdateEmailConfirmUseCase | undefined;
	private _updateEmailRequestUseCase: IUpdateEmailRequestUseCase | undefined;
	private _validateEmailVerificationSessionUseCase: IValidateEmailVerificationSessionUseCase | undefined;

	private _externalAuthLoginCallbackUseCase: IExternalAuthLoginCallbackUseCase | undefined;
	private _externalAuthLoginRequestUseCase: IExternalAuthRequestUseCase | undefined;
	private _externalAuthSignupCallbackUseCase: IExternalAuthSignupCallbackUseCase | undefined;
	private _externalAuthSignupRequestUseCase: IExternalAuthRequestUseCase | undefined;

	private _passwordResetRequestUseCase: IPasswordResetRequestUseCase | undefined;
	private _passwordResetVerifyEmailUseCase: IPasswordResetVerifyEmailUseCase | undefined;
	private _resetPasswordUseCase: IResetPasswordUseCase | undefined;
	private _updatePasswordUseCase: IUpdatePasswordUseCase | undefined;
	private _validatePasswordResetSessionUseCase: IValidatePasswordResetSessionUseCase | undefined;

	constructor(envVariables: EnvVariables, coreContainer: ICoreDIContainer, override?: Partial<IAuthDIContainer>) {
		this.envVariables = envVariables;

		this.coreContainer = coreContainer;

		const overrides = override ?? {};

		// Infra
		if (overrides.accountLinkOAuthStateSigner) {
			this._accountLinkOAuthStateSigner = overrides.accountLinkOAuthStateSigner;
		}
		if (overrides.externalAuthOAuthStateSigner) {
			this._externalAuthOAuthStateSigner = overrides.externalAuthOAuthStateSigner;
		}

		// Gateways
		if (overrides.googleOAuthGateways) {
			this._googleOAuthGateways = overrides.googleOAuthGateways;
		}
		if (overrides.discordOAuthGateways) {
			this._discordOAuthGateways = overrides.discordOAuthGateways;
		}

		// Repositories
		if (overrides.accountAssociationSessionRepository) {
			this._accountAssociationSessionRepository = overrides.accountAssociationSessionRepository;
		}
		if (overrides.accountLinkSessionRepository) {
			this._accountLinkSessionRepository = overrides.accountLinkSessionRepository;
		}
		if (overrides.authUserRepository) {
			this._authUserRepository = overrides.authUserRepository;
		}
		if (overrides.emailVerificationSessionRepository) {
			this._emailVerificationSessionRepository = overrides.emailVerificationSessionRepository;
		}
		if (overrides.externalIdentityRepository) {
			this._externalIdentityRepository = overrides.externalIdentityRepository;
		}
		if (overrides.passwordResetSessionRepository) {
			this._passwordResetSessionRepository = overrides.passwordResetSessionRepository;
		}
		if (overrides.sessionRepository) {
			this._sessionRepository = overrides.sessionRepository;
		}
		if (overrides.signupSessionRepository) {
			this._signupSessionRepository = overrides.signupSessionRepository;
		}

		// Use Cases
		if (overrides.accountAssociationChallengeUseCase) {
			this._accountAssociationChallengeUseCase = overrides.accountAssociationChallengeUseCase;
		}
		if (overrides.accountAssociationConfirmUseCase) {
			this._accountAssociationConfirmUseCase = overrides.accountAssociationConfirmUseCase;
		}
		if (overrides.validateAccountAssociationSessionUseCase) {
			this._validateAccountAssociationSessionUseCase = overrides.validateAccountAssociationSessionUseCase;
		}

		if (overrides.accountLinkCallbackUseCase) {
			this._accountLinkCallbackUseCase = overrides.accountLinkCallbackUseCase;
		}
		if (overrides.accountLinkRequestUseCase) {
			this._accountLinkRequestUseCase = overrides.accountLinkRequestUseCase;
		}
		if (overrides.accountLinkPrepareUseCase) {
			this._accountLinkPrepareUseCase = overrides.accountLinkPrepareUseCase;
		}

		if (overrides.getConnectionsUseCase) {
			this._getConnectionsUseCase = overrides.getConnectionsUseCase;
		}
		if (overrides.unlinkAccountConnectionUseCase) {
			this._unlinkAccountConnectionUseCase = overrides.unlinkAccountConnectionUseCase;
		}

		if (overrides.loginUseCase) {
			this._loginUseCase = overrides.loginUseCase;
		}
		if (overrides.logoutUseCase) {
			this._logoutUseCase = overrides.logoutUseCase;
		}
		if (overrides.signupRequestUseCase) {
			this._signupRequestUseCase = overrides.signupRequestUseCase;
		}
		if (overrides.signupConfirmUseCase) {
			this._signupConfirmUseCase = overrides.signupConfirmUseCase;
		}
		if (overrides.signupVerifyEmailUseCase) {
			this._signupVerifyEmailUseCase = overrides.signupVerifyEmailUseCase;
		}
		if (overrides.validateSessionUseCase) {
			this._validateSessionUseCase = overrides.validateSessionUseCase;
		}
		if (overrides.validateSignupSessionUseCase) {
			this._validateSignupSessionUseCase = overrides.validateSignupSessionUseCase;
		}

		if (overrides.emailVerificationConfirmUseCase) {
			this._emailVerificationConfirmUseCase = overrides.emailVerificationConfirmUseCase;
		}
		if (overrides.emailVerificationRequestUseCase) {
			this._emailVerificationRequestUseCase = overrides.emailVerificationRequestUseCase;
		}
		if (overrides.updateEmailConfirmUseCase) {
			this._updateEmailConfirmUseCase = overrides.updateEmailConfirmUseCase;
		}
		if (overrides.updateEmailRequestUseCase) {
			this._updateEmailRequestUseCase = overrides.updateEmailRequestUseCase;
		}
		if (overrides.validateEmailVerificationSessionUseCase) {
			this._validateEmailVerificationSessionUseCase = overrides.validateEmailVerificationSessionUseCase;
		}

		if (overrides.externalAuthLoginCallbackUseCase) {
			this._externalAuthLoginCallbackUseCase = overrides.externalAuthLoginCallbackUseCase;
		}
		if (overrides.externalAuthLoginRequestUseCase) {
			this._externalAuthLoginRequestUseCase = overrides.externalAuthLoginRequestUseCase;
		}
		if (overrides.externalAuthSignupRequestUseCase) {
			this._externalAuthSignupRequestUseCase = overrides.externalAuthSignupRequestUseCase;
		}
		if (overrides.externalAuthSignupCallbackUseCase) {
			this._externalAuthSignupCallbackUseCase = overrides.externalAuthSignupCallbackUseCase;
		}

		if (overrides.passwordResetRequestUseCase) {
			this._passwordResetRequestUseCase = overrides.passwordResetRequestUseCase;
		}
		if (overrides.passwordResetVerifyEmailUseCase) {
			this._passwordResetVerifyEmailUseCase = overrides.passwordResetVerifyEmailUseCase;
		}
		if (overrides.resetPasswordUseCase) {
			this._resetPasswordUseCase = overrides.resetPasswordUseCase;
		}
		if (overrides.updatePasswordUseCase) {
			this._updatePasswordUseCase = overrides.updatePasswordUseCase;
		}
		if (overrides.validatePasswordResetSessionUseCase) {
			this._validatePasswordResetSessionUseCase = overrides.validatePasswordResetSessionUseCase;
		}
	}

	// ========================================
	// Infra
	// ========================================
	get accountLinkOAuthStateSigner(): IHmacOAuthStateSigner<typeof accountLinkStateSchema> {
		if (!this._accountLinkOAuthStateSigner) {
			this._accountLinkOAuthStateSigner = new HmacOAuthStateSigner(
				accountLinkStateSchema,
				this.coreContainer.hmacSha256,
			);
		}
		return this._accountLinkOAuthStateSigner;
	}
	get externalAuthOAuthStateSigner(): IHmacOAuthStateSigner<typeof oauthStateSchema> {
		if (!this._externalAuthOAuthStateSigner) {
			this._externalAuthOAuthStateSigner = new HmacOAuthStateSigner(oauthStateSchema, this.coreContainer.hmacSha256);
		}
		return this._externalAuthOAuthStateSigner;
	}

	// ========================================
	// Gateways
	// ========================================
	get googleOAuthGateways(): ProviderGateways {
		if (!this._googleOAuthGateways) {
			this._googleOAuthGateways = createGoogleGateways(this.envVariables.APP_ENV === "production", {
				clientId: this.envVariables.GOOGLE_CLIENT_ID,
				clientSecret: this.envVariables.GOOGLE_CLIENT_SECRET,
			});
		}
		return this._googleOAuthGateways;
	}

	get discordOAuthGateways(): ProviderGateways {
		if (!this._discordOAuthGateways) {
			this._discordOAuthGateways = createDiscordGateways(this.envVariables.APP_ENV === "production", {
				clientId: this.envVariables.DISCORD_CLIENT_ID,
				clientSecret: this.envVariables.DISCORD_CLIENT_SECRET,
			});
		}
		return this._discordOAuthGateways;
	}

	// ========================================
	// Repositories
	// ========================================

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

	get externalIdentityRepository(): IExternalIdentityRepository {
		if (!this._externalIdentityRepository) {
			this._externalIdentityRepository = new ExternalIdentityRepository(this.coreContainer.drizzleService);
		}
		return this._externalIdentityRepository;
	}

	get accountAssociationSessionRepository(): IAccountAssociationSessionRepository {
		if (!this._accountAssociationSessionRepository) {
			this._accountAssociationSessionRepository = new AccountAssociationSessionRepository(
				this.coreContainer.drizzleService,
			);
		}
		return this._accountAssociationSessionRepository;
	}

	get accountLinkSessionRepository(): IAccountLinkSessionRepository {
		if (!this._accountLinkSessionRepository) {
			this._accountLinkSessionRepository = new AccountLinkSessionRepository(this.coreContainer.drizzleService);
		}
		return this._accountLinkSessionRepository;
	}

	// ========================================
	// Use Cases
	// ========================================
	get accountAssociationChallengeUseCase(): IAccountAssociationChallengeUseCase {
		if (!this._accountAssociationChallengeUseCase) {
			this._accountAssociationChallengeUseCase = new AccountAssociationChallengeUseCase(
				this.accountAssociationSessionRepository,
				this.coreContainer.sessionSecretHasher,
				this.coreContainer.randomGenerator,
				this.coreContainer.emailGateway,
			);
		}
		return this._accountAssociationChallengeUseCase;
	}
	get accountAssociationConfirmUseCase(): IAccountAssociationConfirmUseCase {
		if (!this._accountAssociationConfirmUseCase) {
			this._accountAssociationConfirmUseCase = new AccountAssociationConfirmUseCase(
				this.authUserRepository,
				this.sessionRepository,
				this.externalIdentityRepository,
				this.accountAssociationSessionRepository,
				this.coreContainer.sessionSecretHasher,
			);
		}
		return this._accountAssociationConfirmUseCase;
	}
	get validateAccountAssociationSessionUseCase(): IValidateAccountAssociationSessionUseCase {
		if (!this._validateAccountAssociationSessionUseCase) {
			this._validateAccountAssociationSessionUseCase = new ValidateAccountAssociationSessionUseCase(
				this.authUserRepository,
				this.accountAssociationSessionRepository,
				this.coreContainer.sessionSecretHasher,
			);
		}
		return this._validateAccountAssociationSessionUseCase;
	}

	get accountLinkCallbackUseCase(): IAccountLinkCallbackUseCase {
		if (!this._accountLinkCallbackUseCase) {
			this._accountLinkCallbackUseCase = new AccountLinkCallbackUseCase(
				this.googleOAuthGateways.link,
				this.discordOAuthGateways.link,
				this.externalIdentityRepository,
				this.accountLinkOAuthStateSigner,
			);
		}
		return this._accountLinkCallbackUseCase;
	}
	get accountLinkRequestUseCase(): IAccountLinkRequestUseCase {
		if (!this._accountLinkRequestUseCase) {
			this._accountLinkRequestUseCase = new AccountLinkRequestUseCase(
				this.googleOAuthGateways.link,
				this.discordOAuthGateways.link,
				this.accountLinkOAuthStateSigner,
				this.accountLinkSessionRepository,
				this.coreContainer.sessionSecretHasher,
			);
		}
		return this._accountLinkRequestUseCase;
	}
	get accountLinkPrepareUseCase(): IAccountLinkPrepareUseCase {
		if (!this._accountLinkPrepareUseCase) {
			this._accountLinkPrepareUseCase = new AccountLinkPrepareUseCase(
				this.accountLinkSessionRepository,
				this.coreContainer.sessionSecretHasher,
			);
		}
		return this._accountLinkPrepareUseCase;
	}

	get getConnectionsUseCase(): IGetConnectionsUseCase {
		if (!this._getConnectionsUseCase) {
			this._getConnectionsUseCase = new GetConnectionsUseCase(this.externalIdentityRepository);
		}
		return this._getConnectionsUseCase;
	}
	get unlinkAccountConnectionUseCase(): IUnlinkAccountConnectionUseCase {
		if (!this._unlinkAccountConnectionUseCase) {
			this._unlinkAccountConnectionUseCase = new UnlinkAccountConnectionUseCase(this.externalIdentityRepository);
		}
		return this._unlinkAccountConnectionUseCase;
	}

	get loginUseCase(): ILoginUseCase {
		if (!this._loginUseCase) {
			this._loginUseCase = new LoginUseCase(
				this.sessionRepository,
				this.authUserRepository,
				this.coreContainer.sessionSecretHasher,
				this.coreContainer.passwordHasher,
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
	get signupConfirmUseCase(): ISignupConfirmUseCase {
		if (!this._signupConfirmUseCase) {
			this._signupConfirmUseCase = new SignupConfirmUseCase(
				this.authUserRepository,
				this.sessionRepository,
				this.signupSessionRepository,
				this.coreContainer.sessionSecretHasher,
				this.coreContainer.passwordHasher,
			);
		}
		return this._signupConfirmUseCase;
	}
	get signupRequestUseCase(): ISignupRequestUseCase {
		if (!this._signupRequestUseCase) {
			this._signupRequestUseCase = new SignupRequestUseCase(
				this.signupSessionRepository,
				this.authUserRepository,
				this.coreContainer.sessionSecretHasher,
				this.coreContainer.randomGenerator,
				this.coreContainer.emailGateway,
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
	get validateSessionUseCase(): IValidateSessionUseCase {
		if (!this._validateSessionUseCase) {
			this._validateSessionUseCase = new ValidateSessionUseCase(
				this.sessionRepository,
				this.authUserRepository,
				this.coreContainer.sessionSecretHasher,
			);
		}
		return this._validateSessionUseCase;
	}
	get validateSignupSessionUseCase(): IValidateSignupSessionUseCase {
		if (!this._validateSignupSessionUseCase) {
			this._validateSignupSessionUseCase = new ValidateSignupSessionUseCase(
				this.signupSessionRepository,
				this.coreContainer.sessionSecretHasher,
			);
		}
		return this._validateSignupSessionUseCase;
	}

	get emailVerificationConfirmUseCase(): IEmailVerificationConfirmUseCase {
		if (!this._emailVerificationConfirmUseCase) {
			this._emailVerificationConfirmUseCase = new EmailVerificationConfirmUseCase(
				this.authUserRepository,
				this.emailVerificationSessionRepository,
			);
		}
		return this._emailVerificationConfirmUseCase;
	}
	get emailVerificationRequestUseCase(): IEmailVerificationRequestUseCase {
		if (!this._emailVerificationRequestUseCase) {
			this._emailVerificationRequestUseCase = new EmailVerificationRequestUseCase(
				this.emailVerificationSessionRepository,
				this.coreContainer.randomGenerator,
				this.coreContainer.sessionSecretHasher,
				this.coreContainer.emailGateway,
			);
		}
		return this._emailVerificationRequestUseCase;
	}
	get updateEmailConfirmUseCase(): IUpdateEmailConfirmUseCase {
		if (!this._updateEmailConfirmUseCase) {
			this._updateEmailConfirmUseCase = new UpdateEmailConfirmUseCase(
				this.authUserRepository,
				this.sessionRepository,
				this.emailVerificationSessionRepository,
				this.coreContainer.sessionSecretHasher,
			);
		}
		return this._updateEmailConfirmUseCase;
	}
	get updateEmailRequestUseCase(): IUpdateEmailRequestUseCase {
		if (!this._updateEmailRequestUseCase) {
			this._updateEmailRequestUseCase = new UpdateEmailRequestUseCase(
				this.emailVerificationSessionRepository,
				this.authUserRepository,
				this.coreContainer.randomGenerator,
				this.coreContainer.sessionSecretHasher,
				this.coreContainer.emailGateway,
			);
		}
		return this._updateEmailRequestUseCase;
	}
	get validateEmailVerificationSessionUseCase(): IValidateEmailVerificationSessionUseCase {
		if (!this._validateEmailVerificationSessionUseCase) {
			this._validateEmailVerificationSessionUseCase = new ValidateEmailVerificationSessionUseCase(
				this.emailVerificationSessionRepository,
				this.coreContainer.sessionSecretHasher,
			);
		}
		return this._validateEmailVerificationSessionUseCase;
	}

	get externalAuthLoginCallbackUseCase(): IExternalAuthLoginCallbackUseCase {
		if (!this._externalAuthLoginCallbackUseCase) {
			this._externalAuthLoginCallbackUseCase = new ExternalAuthLoginCallbackUseCase(
				this.googleOAuthGateways.login,
				this.discordOAuthGateways.login,
				this.sessionRepository,
				this.externalIdentityRepository,
				this.authUserRepository,
				this.accountAssociationSessionRepository,
				this.coreContainer.sessionSecretHasher,
				this.externalAuthOAuthStateSigner,
			);
		}
		return this._externalAuthLoginCallbackUseCase;
	}
	get externalAuthLoginRequestUseCase(): IExternalAuthRequestUseCase {
		if (!this._externalAuthLoginRequestUseCase) {
			this._externalAuthLoginRequestUseCase = new ExternalAuthRequestUseCase(
				this.googleOAuthGateways.login,
				this.discordOAuthGateways.login,
				this.externalAuthOAuthStateSigner,
			);
		}
		return this._externalAuthLoginRequestUseCase;
	}
	get externalAuthSignupCallbackUseCase(): IExternalAuthSignupCallbackUseCase {
		if (!this._externalAuthSignupCallbackUseCase) {
			this._externalAuthSignupCallbackUseCase = new ExternalAuthSignupCallbackUseCase(
				this.googleOAuthGateways.signup,
				this.discordOAuthGateways.signup,
				this.sessionRepository,
				this.externalIdentityRepository,
				this.authUserRepository,
				this.accountAssociationSessionRepository,
				this.coreContainer.sessionSecretHasher,
				this.externalAuthOAuthStateSigner,
			);
		}
		return this._externalAuthSignupCallbackUseCase;
	}
	get externalAuthSignupRequestUseCase(): IExternalAuthRequestUseCase {
		if (!this._externalAuthSignupRequestUseCase) {
			this._externalAuthSignupRequestUseCase = new ExternalAuthRequestUseCase(
				this.googleOAuthGateways.signup,
				this.discordOAuthGateways.signup,
				this.externalAuthOAuthStateSigner,
			);
		}
		return this._externalAuthSignupRequestUseCase;
	}

	get passwordResetRequestUseCase(): IPasswordResetRequestUseCase {
		if (!this._passwordResetRequestUseCase) {
			this._passwordResetRequestUseCase = new PasswordResetRequestUseCase(
				this.authUserRepository,
				this.passwordResetSessionRepository,
				this.coreContainer.randomGenerator,
				this.coreContainer.sessionSecretHasher,
				this.coreContainer.emailGateway,
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
	get resetPasswordUseCase(): IResetPasswordUseCase {
		if (!this._resetPasswordUseCase) {
			this._resetPasswordUseCase = new ResetPasswordUseCase(
				this.authUserRepository,
				this.sessionRepository,
				this.passwordResetSessionRepository,
				this.coreContainer.passwordHasher,
			);
		}
		return this._resetPasswordUseCase;
	}
	get updatePasswordUseCase(): IUpdatePasswordUseCase {
		if (!this._updatePasswordUseCase) {
			this._updatePasswordUseCase = new UpdatePasswordUseCase(
				this.authUserRepository,
				this.sessionRepository,
				this.coreContainer.passwordHasher,
				this.coreContainer.sessionSecretHasher,
			);
		}
		return this._updatePasswordUseCase;
	}
	get validatePasswordResetSessionUseCase(): IValidatePasswordResetSessionUseCase {
		if (!this._validatePasswordResetSessionUseCase) {
			this._validatePasswordResetSessionUseCase = new ValidatePasswordResetSessionUseCase(
				this.passwordResetSessionRepository,
				this.authUserRepository,
				this.coreContainer.sessionSecretHasher,
			);
		}
		return this._validatePasswordResetSessionUseCase;
	}
}
