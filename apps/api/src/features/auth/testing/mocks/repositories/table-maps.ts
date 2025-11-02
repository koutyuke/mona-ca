import type { UserId } from "../../../../../core/domain/value-objects";
import type { AccountAssociationSession } from "../../../domain/entities/account-association-session";
import type { AccountLinkSession } from "../../../domain/entities/account-link-session";
import type { EmailVerificationSession } from "../../../domain/entities/email-verification-session";
import type { ExternalIdentity } from "../../../domain/entities/external-identity";
import type { PasswordResetSession } from "../../../domain/entities/password-reset-session";
import type { Session } from "../../../domain/entities/session";
import type { SignupSession } from "../../../domain/entities/signup-session";
import type { UserRegistration } from "../../../domain/entities/user-registration";
import type {
	ExternalIdentityProvider,
	ExternalIdentityProviderUserId,
} from "../../../domain/value-objects/external-identity";
import type {
	AccountAssociationSessionId,
	AccountLinkSessionId,
	EmailVerificationSessionId,
	PasswordResetSessionId,
	SessionId,
	SignupSessionId,
} from "../../../domain/value-objects/ids";

export const createAuthUsersMap = (users: UserRegistration[] = []): Map<UserId, UserRegistration> => {
	return new Map(users.map(userRegistration => [userRegistration.id, userRegistration]));
};

export const createSessionsMap = (sessions: Session[] = []): Map<SessionId, Session> => {
	return new Map(sessions.map(session => [session.id, session]));
};

export const createPasswordResetSessionsMap = (
	sessions: PasswordResetSession[] = [],
): Map<PasswordResetSessionId, PasswordResetSession> => {
	return new Map(sessions.map(session => [session.id, session]));
};

export const createEmailVerificationSessionsMap = (
	sessions: EmailVerificationSession[] = [],
): Map<EmailVerificationSessionId, EmailVerificationSession> => {
	return new Map(sessions.map(session => [session.id, session]));
};

export const createAccountAssociationSessionsMap = (
	sessions: AccountAssociationSession[] = [],
): Map<AccountAssociationSessionId, AccountAssociationSession> => {
	return new Map(sessions.map(session => [session.id, session]));
};

export const createExternalIdentitiesMap = (
	externalIdentities: ExternalIdentity[] = [],
): Map<string, ExternalIdentity> => {
	return new Map(
		externalIdentities.map(externalIdentity => [
			`${externalIdentity.provider}-${externalIdentity.providerUserId}`,
			externalIdentity,
		]),
	);
};

export const createExternalIdentityKey = (
	provider: ExternalIdentityProvider,
	providerUserId: ExternalIdentityProviderUserId,
): string => {
	return `${provider}-${providerUserId}`;
};

export const createSignupSessionsMap = (sessions: SignupSession[] = []): Map<SignupSessionId, SignupSession> => {
	return new Map(sessions.map(session => [session.id, session]));
};

export const createAccountLinkSessionsMap = (
	sessions: AccountLinkSession[] = [],
): Map<AccountLinkSessionId, AccountLinkSession> => {
	return new Map(sessions.map(session => [session.id, session]));
};
