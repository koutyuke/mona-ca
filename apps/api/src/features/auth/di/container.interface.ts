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
import type { federatedAuthStateSchema } from "../application/use-cases/federated-auth/schema";
import type { providerLinkStateSchema } from "../application/use-cases/provider-link/schema";

export interface IAuthDIContainer {
	// === Infra ===
	readonly providerLinkSignedStateService: IHmacSignedStateService<typeof providerLinkStateSchema>;
	readonly federatedAuthSignedStateService: IHmacSignedStateService<typeof federatedAuthStateSchema>;

	// === Gateways ===
	readonly providerLinkGoogleIdentityProviderGateway: IIdentityProviderGateway;
	readonly providerLinkDiscordIdentityProviderGateway: IIdentityProviderGateway;
	readonly federatedAuthDiscordIdentityProviderGateway: IIdentityProviderGateway;
	readonly federatedAuthGoogleIdentityProviderGateway: IIdentityProviderGateway;

	// === Repositories ===
	readonly providerLinkProposalRepository: IProviderLinkProposalRepository;
	readonly authUserRepository: IAuthUserRepository;
	readonly emailVerificationRequestRepository: IEmailVerificationRequestRepository;
	readonly passwordResetSessionRepository: IPasswordResetSessionRepository;
	readonly providerAccountRepository: IProviderAccountRepository;
	readonly providerLinkRequestRepository: IProviderLinkRequestRepository;
	readonly sessionRepository: ISessionRepository;
	readonly signupSessionRepository: ISignupSessionRepository;

	// === Use Cases ===

	// Email Verification
	readonly emailVerificationVerifyEmailUseCase: IEmailVerificationVerifyEmailUseCase;
	readonly emailVerificationRequestUseCase: IEmailVerificationRequestUseCase;
	readonly emailVerificationValidateRequestUseCase: IEmailVerificationValidateRequestUseCase;

	// Federated Auth
	readonly federatedAuthCallbackUseCase: IFederatedAuthCallbackUseCase;
	readonly federatedAuthRequestUseCase: IFederatedAuthRequestUseCase;

	// Password Reset
	readonly passwordResetResetUseCase: IPasswordResetResetUseCase;
	readonly passwordResetRequestUseCase: IPasswordResetRequestUseCase;
	readonly passwordResetVerifyEmailUseCase: IPasswordResetVerifyEmailUseCase;
	readonly passwordResetValidateSessionUseCase: IPasswordResetValidateSessionUseCase;

	// Provider Link
	readonly providerLinkCallbackUseCase: IProviderLinkCallbackUseCase;
	readonly providerLinkPrepareUseCase: IProviderLinkPrepareUseCase;
	readonly providerLinkRequestUseCase: IProviderLinkRequestUseCase;
	readonly providerLinkProposalReissueUseCase: IProviderLinkProposalReissueUseCase;
	readonly providerLinkProposalVerifyEmailUseCase: IProviderLinkProposalVerifyEmailUseCase;
	readonly providerLinkValidateRequestUseCase: IProviderLinkValidateRequestUseCase;
	readonly providerLinkValidateProposalUseCase: IProviderLinkValidateProposalUseCase;
	readonly providerLinkUnlinkUseCase: IProviderLinkUnlinkUseCase;

	// Session
	readonly listAuthMethodsUseCase: IListAuthMethodsUseCase;
	readonly loginUseCase: ILoginUseCase;
	readonly logoutUseCase: ILogoutUseCase;
	readonly updatePasswordUseCase: IUpdatePasswordUseCase;
	readonly validateSessionUseCase: IValidateSessionUseCase;

	// Signup
	readonly signupRegisterUseCase: ISignupRegisterUseCase;
	readonly signupRequestUseCase: ISignupRequestUseCase;
	readonly signupVerifyEmailUseCase: ISignupVerifyEmailUseCase;
	readonly signupValidateSessionUseCase: ISignupValidateSessionUseCase;

	// Update Email
	readonly updateEmailVerifyEmailUseCase: IUpdateEmailVerifyEmailUseCase;
	readonly updateEmailRequestUseCase: IUpdateEmailRequestUseCase;
}
