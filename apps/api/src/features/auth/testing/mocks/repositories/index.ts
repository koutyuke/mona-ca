export { AuthUserRepositoryMock } from "./auth-user.repository.mock";
export { SessionRepositoryMock } from "./session.repository.mock";
export { PasswordResetSessionRepositoryMock } from "./password-reset-session.repository.mock";
export { EmailVerificationSessionRepositoryMock } from "./email-verification-session.repository.mock";
export { AccountAssociationSessionRepositoryMock } from "./account-association-session.repository.mock";
export { AccountLinkSessionRepositoryMock } from "./account-link-session.repository.mock";
export { ExternalIdentityRepositoryMock } from "./external-identity.repository.mock";
export { SignupSessionRepositoryMock } from "./signup-session.repository.mock";

export {
	createAuthUsersMap,
	createSessionsMap,
	createPasswordResetSessionsMap,
	createEmailVerificationSessionsMap,
	createAccountAssociationSessionsMap,
	createAccountLinkSessionsMap,
	createExternalIdentitiesMap,
	createExternalIdentityKey,
	createSignupSessionsMap,
} from "./table-maps";
