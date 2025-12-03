import type { IAccountLinkReissueSessionUseCase } from "../application/contracts/account-link/reissue-session.usecase.interface";
import type { IAccountLinkValidateSessionUseCase } from "../application/contracts/account-link/validate-session.usecase.interface";
import type { IAccountLinkVerifyCodeUseCase } from "../application/contracts/account-link/verify-code.usecase.interface";
import type { IEmailVerificationRequestUseCase } from "../application/contracts/email-verification/request.usecase.interface";
import type { IEmailVerificationValidateSessionUseCase } from "../application/contracts/email-verification/validate-email-verification-session.usecase.interface";
import type { IEmailVerificationVerifyCodeUseCase } from "../application/contracts/email-verification/verify-code.usecase.interface";
import type { IFederatedAuthCallbackUseCase } from "../application/contracts/federated-auth/callback.usecase.interface";
import type { IFederatedAuthRequestUseCase } from "../application/contracts/federated-auth/request.usecase.interface";
import type { IPasswordResetRequestUseCase } from "../application/contracts/password-reset/request.usecase.interface";
import type { IPasswordResetResetUseCase } from "../application/contracts/password-reset/reset.usecase.interface";
import type { IPasswordResetValidateSessionUseCase } from "../application/contracts/password-reset/validate-session.usecase.interface";
import type { IPasswordResetVerifyCodeUseCase } from "../application/contracts/password-reset/verify-code.usecase.interface";
import type { IProviderConnectionCallbackUseCase } from "../application/contracts/provider-connection/callback.usecase.interface";
import type { IProviderConnectionDisconnectUseCase } from "../application/contracts/provider-connection/disconnect.usecase.interface";
import type { IProviderConnectionPrepareUseCase } from "../application/contracts/provider-connection/prepare.usecase.interface";
import type { IProviderConnectionRequestUseCase } from "../application/contracts/provider-connection/request.usecase.interface";
import type { IProviderConnectionValidateTicketUseCase } from "../application/contracts/provider-connection/validate-ticket.usecase.interface";
import type { IListAuthMethodsUseCase } from "../application/contracts/session/list-auth-methods.usecase.interface";
import type { ILoginUseCase } from "../application/contracts/session/login.usecase.interface";
import type { ILogoutUseCase } from "../application/contracts/session/logout.usecase.interface";
import type { IUpdatePasswordUseCase } from "../application/contracts/session/update-password.usecase.interface";
import type { IValidateSessionUseCase } from "../application/contracts/session/validate-session.usecase.interface";
import type { ISignupRegisterUseCase } from "../application/contracts/signup/register.usecase.interface";
import type { ISignupRequestUseCase } from "../application/contracts/signup/request.usecase.interface";
import type { ISignupValidateSessionUseCase } from "../application/contracts/signup/validate-session.usecase.interface";
import type { ISignupVerifyCodeUseCase } from "../application/contracts/signup/verify-code.usecase.interface";
import type { IUpdateEmailRequestUseCase } from "../application/contracts/update-email/request.usecase.interface";
import type { IUpdateEmailVerifyCodeUseCase } from "../application/contracts/update-email/verify-code.usecase.interface";
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
import type { oauthStateSchema } from "../application/use-cases/federated-auth/schema";
import type { providerConnectionStateSchema } from "../application/use-cases/provider-connection/schema";

export interface IAuthDIContainer {
	// === Infra ===
	readonly providerConnectionOAuthStateService: IHmacOAuthStateService<typeof providerConnectionStateSchema>;
	readonly federatedAuthHmacOAuthStateService: IHmacOAuthStateService<typeof oauthStateSchema>;

	// === Gateways ===
	readonly providerConnectionGoogleIdentityProviderGateway: IIdentityProviderGateway;
	readonly providerConnectionDiscordIdentityProviderGateway: IIdentityProviderGateway;
	readonly federatedAuthDiscordIdentityProviderGateway: IIdentityProviderGateway;
	readonly federatedAuthGoogleIdentityProviderGateway: IIdentityProviderGateway;

	// === Repositories ===
	readonly accountLinkSessionRepository: IAccountLinkSessionRepository;
	readonly authUserRepository: IAuthUserRepository;
	readonly emailVerificationSessionRepository: IEmailVerificationSessionRepository;
	readonly passwordResetSessionRepository: IPasswordResetSessionRepository;
	readonly providerAccountRepository: IProviderAccountRepository;
	readonly providerConnectionTicketRepository: IProviderConnectionTicketRepository;
	readonly sessionRepository: ISessionRepository;
	readonly signupSessionRepository: ISignupSessionRepository;

	// === Use Cases ===

	// Account Link
	readonly accountLinkVerifyCodeUseCase: IAccountLinkVerifyCodeUseCase;
	readonly accountLinkReissueSessionUseCase: IAccountLinkReissueSessionUseCase;
	readonly accountLinkValidateSessionUseCase: IAccountLinkValidateSessionUseCase;

	// Email Verification
	readonly emailVerificationVerifyCodeUseCase: IEmailVerificationVerifyCodeUseCase;
	readonly emailVerificationRequestUseCase: IEmailVerificationRequestUseCase;
	readonly emailVerificationValidateSessionUseCase: IEmailVerificationValidateSessionUseCase;

	// Federated Auth
	readonly federatedAuthCallbackUseCase: IFederatedAuthCallbackUseCase;
	readonly federatedAuthRequestUseCase: IFederatedAuthRequestUseCase;

	// Password Reset
	readonly passwordResetResetUseCase: IPasswordResetResetUseCase;
	readonly passwordResetRequestUseCase: IPasswordResetRequestUseCase;
	readonly passwordResetVerifyCodeUseCase: IPasswordResetVerifyCodeUseCase;
	readonly passwordResetValidateSessionUseCase: IPasswordResetValidateSessionUseCase;

	// Provider Connection
	readonly providerConnectionCallbackUseCase: IProviderConnectionCallbackUseCase;
	readonly providerConnectionDisconnectUseCase: IProviderConnectionDisconnectUseCase;
	readonly providerConnectionRequestUseCase: IProviderConnectionRequestUseCase;
	readonly providerConnectionPrepareUseCase: IProviderConnectionPrepareUseCase;
	readonly providerConnectionValidateTicketUseCase: IProviderConnectionValidateTicketUseCase;

	// Session
	readonly listAuthMethodsUseCase: IListAuthMethodsUseCase;
	readonly loginUseCase: ILoginUseCase;
	readonly logoutUseCase: ILogoutUseCase;
	readonly updatePasswordUseCase: IUpdatePasswordUseCase;
	readonly validateSessionUseCase: IValidateSessionUseCase;

	// Signup
	readonly signupRegisterUseCase: ISignupRegisterUseCase;
	readonly signupRequestUseCase: ISignupRequestUseCase;
	readonly signupVerifyCodeUseCase: ISignupVerifyCodeUseCase;
	readonly signupValidateSessionUseCase: ISignupValidateSessionUseCase;

	// Update Email
	readonly updateEmailVerifyCodeUseCase: IUpdateEmailVerifyCodeUseCase;
	readonly updateEmailRequestUseCase: IUpdateEmailRequestUseCase;
}
