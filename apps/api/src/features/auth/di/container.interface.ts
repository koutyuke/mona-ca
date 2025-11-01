import type { ProviderGateways } from "../adapters/gateways/oauth-provider/type";
import type { IAccountAssociationChallengeUseCase } from "../application/contracts/account-association/account-association-challenge.usecase.interface";
import type { IAccountAssociationConfirmUseCase } from "../application/contracts/account-association/account-association-confirm.usecase.interface";
import type { IValidateAccountAssociationSessionUseCase } from "../application/contracts/account-association/validate-account-association-session.usecase.interface";
import type { IAccountLinkCallbackUseCase } from "../application/contracts/account-link/account-link-callback.usecase.interface";
import type { IAccountLinkRequestUseCase } from "../application/contracts/account-link/account-link-request.usecase.interface";
import type { IGetConnectionsUseCase } from "../application/contracts/account-link/get-connections.usecase.interface";
import type { IUnlinkAccountConnectionUseCase } from "../application/contracts/account-link/unlink-account-connection.usecase.interface";
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
import type { IAuthUserRepository } from "../application/ports/repositories/auth-user.repository.interface";
import type { IEmailVerificationSessionRepository } from "../application/ports/repositories/email-verification-session.repository.interface";
import type { IExternalIdentityRepository } from "../application/ports/repositories/external-identity.repository.interface";
import type { IPasswordResetSessionRepository } from "../application/ports/repositories/password-reset-session.repository.interface";
import type { ISessionRepository } from "../application/ports/repositories/session.repository.interface";
import type { ISignupSessionRepository } from "../application/ports/repositories/signup-session.repository.interface";
import type { accountLinkStateSchema } from "../application/use-cases/account-link/schema";
import type { oauthStateSchema } from "../application/use-cases/external-auth/schema";

export interface IAuthDIContainer {
	// Infra
	readonly accountLinkOAuthStateSigner: IHmacOAuthStateSigner<typeof accountLinkStateSchema>;
	readonly externalAuthOAuthStateSigner: IHmacOAuthStateSigner<typeof oauthStateSchema>;

	// Gateways
	readonly googleOAuthGateways: ProviderGateways;
	readonly discordOAuthGateways: ProviderGateways;

	// Repositories
	readonly accountAssociationSessionRepository: IAccountAssociationSessionRepository;
	readonly authUserRepository: IAuthUserRepository;
	readonly emailVerificationSessionRepository: IEmailVerificationSessionRepository;
	readonly externalIdentityRepository: IExternalIdentityRepository;
	readonly passwordResetSessionRepository: IPasswordResetSessionRepository;
	readonly sessionRepository: ISessionRepository;
	readonly signupSessionRepository: ISignupSessionRepository;

	// Use Cases
	readonly accountAssociationChallengeUseCase: IAccountAssociationChallengeUseCase;
	readonly accountAssociationConfirmUseCase: IAccountAssociationConfirmUseCase;
	readonly validateAccountAssociationSessionUseCase: IValidateAccountAssociationSessionUseCase;

	readonly accountLinkCallbackUseCase: IAccountLinkCallbackUseCase;
	readonly accountLinkRequestUseCase: IAccountLinkRequestUseCase;
	readonly getConnectionsUseCase: IGetConnectionsUseCase;
	readonly unlinkAccountConnectionUseCase: IUnlinkAccountConnectionUseCase;

	readonly loginUseCase: ILoginUseCase;
	readonly logoutUseCase: ILogoutUseCase;
	readonly signupRequestUseCase: ISignupRequestUseCase;
	readonly signupConfirmUseCase: ISignupConfirmUseCase;
	readonly signupVerifyEmailUseCase: ISignupVerifyEmailUseCase;
	readonly validateSessionUseCase: IValidateSessionUseCase;
	readonly validateSignupSessionUseCase: IValidateSignupSessionUseCase;

	readonly emailVerificationConfirmUseCase: IEmailVerificationConfirmUseCase;
	readonly emailVerificationRequestUseCase: IEmailVerificationRequestUseCase;
	readonly updateEmailConfirmUseCase: IUpdateEmailConfirmUseCase;
	readonly updateEmailRequestUseCase: IUpdateEmailRequestUseCase;
	readonly validateEmailVerificationSessionUseCase: IValidateEmailVerificationSessionUseCase;

	readonly externalAuthLoginCallbackUseCase: IExternalAuthLoginCallbackUseCase;
	readonly externalAuthLoginRequestUseCase: IExternalAuthRequestUseCase;
	readonly externalAuthSignupCallbackUseCase: IExternalAuthSignupCallbackUseCase;
	readonly externalAuthSignupRequestUseCase: IExternalAuthRequestUseCase;

	readonly passwordResetRequestUseCase: IPasswordResetRequestUseCase;
	readonly passwordResetVerifyEmailUseCase: IPasswordResetVerifyEmailUseCase;
	readonly resetPasswordUseCase: IResetPasswordUseCase;
	readonly updatePasswordUseCase: IUpdatePasswordUseCase;
	readonly validatePasswordResetSessionUseCase: IValidatePasswordResetSessionUseCase;
}
