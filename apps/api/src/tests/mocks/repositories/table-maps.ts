import type {
	AccountAssociationSession,
	EmailVerificationSession,
	OAuthAccount,
	PasswordResetSession,
	Session,
	User,
} from "../../../domain/entities";
import type {
	AccountAssociationSessionId,
	EmailVerificationSessionId,
	OAuthProvider,
	OAuthProviderId,
	PasswordResetSessionId,
	SessionId,
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

export const createOAuthAccountsMap = (accounts: OAuthAccount[] = []): Map<string, OAuthAccount> => {
	return new Map(accounts.map(account => [`${account.provider}-${account.providerId}`, account]));
};

export const createOAuthAccountKey = (provider: OAuthProvider, providerId: OAuthProviderId): string => {
	return `${provider}-${providerId}`;
};
