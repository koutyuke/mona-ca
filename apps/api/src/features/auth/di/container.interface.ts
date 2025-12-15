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
import type { IProviderLinkProposalReissueUseCase } from "../application/ports/in/provider-link/proposal-reissue.usecase.interface";
import type { IProviderLinkProposalVerifyEmailUseCase } from "../application/ports/in/provider-link/proposal-verify-email.usecase.interface";
import type { IProviderLinkRequestUseCase } from "../application/ports/in/provider-link/request.usecase.interface";
import type { IProviderLinkUnlinkUseCase } from "../application/ports/in/provider-link/unlink.usecase.interface";
import type { IProviderLinkValidateProposalUseCase } from "../application/ports/in/provider-link/validate-proposal.usecase.interface";
import type { IProviderLinkValidateRequestUseCase } from "../application/ports/in/provider-link/validate-request.usecase.interface";
import type { IListAuthMethodsUseCase } from "../application/ports/in/session/list-auth-methods.usecase.interface";
import type { ILoginUseCase } from "../application/ports/in/session/login.usecase.interface";
import type { ILogoutUseCase } from "../application/ports/in/session/logout.usecase.interface";
import type { IUpdatePasswordUseCase } from "../application/ports/in/session/update-password.usecase.interface";
import type { IValidateSessionUseCase } from "../application/ports/in/session/validate-session.usecase.interface";
import type { ISignupRegisterUseCase } from "../application/ports/in/signup/register.usecase.interface";
import type { ISignupRequestUseCase } from "../application/ports/in/signup/request.usecase.interface";
import type { ISignupValidateSessionUseCase } from "../application/ports/in/signup/validate-session.usecase.interface";
import type { ISignupVerifyEmailUseCase } from "../application/ports/in/signup/verify-email.usecase.interface";
import type { IUpdateEmailRequestUseCase } from "../application/ports/in/update-email/request.usecase.interface";
import type { IUpdateEmailVerifyEmailUseCase } from "../application/ports/in/update-email/verify-email.usecase.interface";
import type { IIdentityProviderGateway } from "../application/ports/out/gateways/identity-provider.gateway.interface";
import type { IHmacSignedStateService } from "../application/ports/out/infra/hmac-signed-state.service.interface";
import type { IAuthUserRepository } from "../application/ports/out/repositories/auth-user.repository.interface";
import type { IEmailVerificationRequestRepository } from "../application/ports/out/repositories/email-verification-request.repository.interface";
import type { IPasswordResetSessionRepository } from "../application/ports/out/repositories/password-reset-session.repository.interface";
import type { IProviderAccountRepository } from "../application/ports/out/repositories/provider-account.repository.interface";
import type { IProviderLinkProposalRepository } from "../application/ports/out/repositories/provider-link-proposal.repository.interface";
import type { IProviderLinkRequestRepository } from "../application/ports/out/repositories/provider-link-request.repository.interface";
import type { ISessionRepository } from "../application/ports/out/repositories/session.repository.interface";
import type { ISignupSessionRepository } from "../application/ports/out/repositories/signup-session.repository.interface";
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
