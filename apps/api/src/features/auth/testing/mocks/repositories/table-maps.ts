import type { UserId } from "../../../../../core/domain/value-objects";
import type { AccountLinkRequest } from "../../../domain/entities/account-link-request";
import type { EmailVerificationRequest } from "../../../domain/entities/email-verification-request";
import type { PasswordResetSession } from "../../../domain/entities/password-reset-session";
import type { ProviderAccount } from "../../../domain/entities/provider-account";
import type { ProviderLinkRequest } from "../../../domain/entities/provider-link-request";
import type { Session } from "../../../domain/entities/session";
import type { SignupSession } from "../../../domain/entities/signup-session";
import type { UserRegistration } from "../../../domain/entities/user-registration";
import type { IdentityProviders, IdentityProvidersUserId } from "../../../domain/value-objects/identity-providers";
import type {
	AccountLinkRequestId,
	EmailVerificationRequestId,
	PasswordResetSessionId,
	ProviderLinkRequestId,
	SessionId,
	SignupSessionId,
} from "../../../domain/value-objects/ids";

export const createAuthUserMap = (users: UserRegistration[] = []): Map<UserId, UserRegistration> => {
	return new Map(users.map(userRegistration => [userRegistration.id, userRegistration]));
};

export const createSessionMap = (sessions: Session[] = []): Map<SessionId, Session> => {
	return new Map(sessions.map(session => [session.id, session]));
};

export const createPasswordResetSessionMap = (
	sessions: PasswordResetSession[] = [],
): Map<PasswordResetSessionId, PasswordResetSession> => {
	return new Map(sessions.map(session => [session.id, session]));
};

export const createEmailVerificationRequestMap = (
	requests: EmailVerificationRequest[] = [],
): Map<EmailVerificationRequestId, EmailVerificationRequest> => {
	return new Map(requests.map(request => [request.id, request]));
};

export const createAccountLinkRequestMap = (
	requests: AccountLinkRequest[] = [],
): Map<AccountLinkRequestId, AccountLinkRequest> => {
	return new Map(requests.map(request => [request.id, request]));
};

export const createProviderAccountMap = (providerAccounts: ProviderAccount[] = []): Map<string, ProviderAccount> => {
	return new Map(
		providerAccounts.map(providerAccount => [
			`${providerAccount.provider}-${providerAccount.providerUserId}`,
			providerAccount,
		]),
	);
};

export const createProviderAccountKey = (
	provider: IdentityProviders,
	providerUserId: IdentityProvidersUserId,
): string => {
	return `${provider}-${providerUserId}`;
};

export const createSignupSessionMap = (sessions: SignupSession[] = []): Map<SignupSessionId, SignupSession> => {
	return new Map(sessions.map(session => [session.id, session]));
};

export const createProviderLinkRequestMap = (
	requests: ProviderLinkRequest[] = [],
): Map<ProviderLinkRequestId, ProviderLinkRequest> => {
	return new Map(requests.map(request => [request.id, request]));
};
