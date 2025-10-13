import type {
	AccountAssociationSession,
	EmailVerificationSession,
	ExternalIdentity,
	PasswordResetSession,
	Session,
	SignupSession,
	User,
} from "../../../domain/entities";
import type {
	AccountAssociationSessionId,
	EmailVerificationSessionId,
	ExternalIdentityProvider,
	ExternalIdentityProviderUserId,
	PasswordResetSessionId,
	SessionId,
	SignupSessionId,
	UserId,
} from "../../../domain/value-object";

export const createUsersMap = (users: User[] = []): Map<UserId, User> => {
	return new Map(users.map(user => [user.id, user]));
};

export const createUserPasswordHashMap = (entries: [UserId, string][] = []): Map<UserId, string> => {
	return new Map(entries);
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

export const createOAuthAccountsMap = (accounts: ExternalIdentity[] = []): Map<string, ExternalIdentity> => {
	return new Map(accounts.map(account => [`${account.provider}-${account.providerUserId}`, account]));
};

export const createOAuthAccountKey = (
	provider: ExternalIdentityProvider,
	providerId: ExternalIdentityProviderUserId,
): string => {
	return `${provider}-${providerId}`;
};

export const createSignupSessionsMap = (sessions: SignupSession[] = []): Map<SignupSessionId, SignupSession> => {
	return new Map(sessions.map(session => [session.id, session]));
};
